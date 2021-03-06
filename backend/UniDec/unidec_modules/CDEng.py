import numpy as np
import os
import scipy
import .unidectools as ud
from .unidec_enginebase import UniDecEngine
from .thermo_reader.ThermoImporter import ThermoDataImporter
from copy import deepcopy
import matplotlib.pyplot as plt
import scipy.fft as fft
from . import unidecstructure, peakstructure, mzMLimporter, IM_functions, fitting
import time
import unidec
from scipy.optimize import curve_fit

cuda = False
xp = np

def switch_gpu_mode(b):
    global xp
    global cuda
    global cp
    global cuda_safedivide
    if b:
        try:
            import cupy as cp
            cuda = True
            xp = cp

            cuda_safedivide = cp.ElementwiseKernel(
                'T x, T y',
                'T z',
                '''
                    if(y !=0){z = x/y;}
                    else{z=0;}
                ''',

                'cuda_safedivide')
            print("Using GPU Mode")
        except Exception as e:
            print("Error in cupy import:", e)
            cuda = False
            xp = np
            print("Error: GPU Mode Off")
    else:
        print("GPU Mode Off")
        cuda = False
        xp = np

def clear_cache():
    cp.fft.config.get_plan_cache().clear()


def Gmax2(darray):
    ints = darray[:, 1]
    boo1 = ints < np.median(ints) * 2

    noisedata = darray[boo1]

    hist, edges = np.histogram(noisedata[:, 1], bins=100)
    edges = edges[1:] - (edges[1] - edges[0]) / 2.

    smoothhist = scipy.ndimage.gaussian_filter1d(hist, 1)

    grad = np.gradient(smoothhist)
    grad2 = np.gradient(grad)

    # gradmin = edges[np.argmin(grad)]

    maxindex = np.argmax(hist)
    grad2maxindex = np.argmax(grad2[maxindex:])
    gradmax2 = edges[maxindex + grad2maxindex]
    # fit = np.polyfit(noisedata[:, 0], noisedata[:, 1], 1)
    # print(fit)
    print("Gradmax2:", gradmax2)
    return gradmax2


def fft_fun(a):
    if cuda:
        A = cp.fft.rfft2(cp.asarray(a))
    else:
        A = fft.rfft2(a)
    return A


def ifft_fun(A, shape):
    if cuda:
        a = cp.fft.irfft2(A, shape)
    else:
        a = fft.irfft2(A, shape)
    return a


def safedivide(a, b):
    if cuda:
        c = cuda_safedivide(a, b)
    else:
        c = ud.safedivide(a, b)
    return c


def ndis(x, y, s):
    return np.exp(-(x - y) * (x - y) / (2.0 * s * s))


def cconv2D_preB(a, B):
    A = fft_fun(a)
    C = A * B
    c = ifft_fun(C, a.shape)
    return xp.abs(c)


def softmax(I, beta):
    numz = len(I)
    E = xp.exp(beta * I)
    Min2 = xp.amin(E, axis=0)
    Sum1 = xp.sum(I, axis=0)
    Sum2 = xp.sum(E, axis=0)
    factor = safedivide(Sum1, Sum2 - Min2 * numz)
    I = (E - Min2) * factor
    return I


def filter_centroid_const(d, mz_threshold=1):
    """
    """
    boo1 = np.diff(d[:, 0]) > mz_threshold
    boo2 = np.append(boo1[0], boo1)
    boo3 = np.append(boo1, boo1[-1])
    boo1 = np.logical_and(boo2, boo3)
    return d[boo1]


def slopefunc(x, slope):
    return slope * x


class UniDecCD(unidec.UniDec):
    def __init__(self):
        """
        UniDecCD Engine

        Consists of three main subclasses: Config, DataContiner, Peaks

        :return: None
        """
        UniDecEngine.__init__(self)
        # Creates the initial array objects
        self.darray = None
        self.farray = None
        self.zarray = None
        self.thermodata = False
        self.harray = []
        # Sets a few default config parameters
        self.config.mzbins = 1
        self.config.rawflag = 1
        self.config.poolflag = 1
        pass

    def gpu_mode(self, gpumode=False):
        switch_gpu_mode(gpumode)

    def open_file(self, path):
        """
        Main function for opening CD-MS files. Supports Thermo Raw, mzML, text, binary, and numpy compressed.

        Calls self.before_open() first to setup UniDec files and directories. Searches first for previously opened
        numpy compressed data. Switches path to that if found. Otherwise it opens the specified path.

        Thermo Data via .Raw or .mzML needs to be corrected first by multiplying by the injection times in units of s.

        Text, binary, and numpy files are opened assuming the first column is m/z, the second is intensity, the third is scans.
        If no third column is provided, it assigns a scan number of 1 to each.
        The m/z, intensity, and scan data is saved in self.darray (the raw data array).

        Next, it filters out any data with intensities of zero.
        The noise is calculated as the median of the non-zero intensities.
        The self.farray (filtered array) is created from self.darray.

        An Import Error is raised if the darray is empty

        The min and max m/z values are set from the darray.

        Then, saves a numpy compressed file if it doesn't exist for faster imports in the future.
        Finally, it opens the config file if found in the _unidecfiles folder.

        :param path: File path to open.
        :return: None
        """
        # Setup
        starttime = time.perf_counter()
        self.path = path
        # Set up UniDec paths
        self.before_open()

        # Get the extension
        extension = os.path.splitext(self.path)[1]

        if extension.lower() == ".raw":
            # Import Thermo Raw file using ThermoDataImporter
            self.TDI = ThermoDataImporter(self.path)
            # Get the data
            data = self.TDI.grab_data()
            # Get the scans
            self.scans = self.TDI.scans
            # Get the injection times for each scan
            self.it = self.TDI.get_inj_time_array()
            # Get the overall resolution
            self.res = self.TDI.msrun.resolution
            # Set flag for correcting injection times later
            self.thermodata = True

        elif extension.lower() == ".mzml" or extension.lower() == ".gz":
            # Import mzML data, scans, and injection time
            # Note, resolution info is not transferred to mzML to my knowledge
            self.MLI = mzMLimporter.mzMLimporter(self.path)
            data = self.MLI.grab_data(threshold=0)
            self.scans = self.MLI.scans
            self.it = self.MLI.get_inj_time_array()
            self.thermodata = True

        elif extension.lower() == ".txt":
            # Simple Text File
            try:
                # Load text file
                data = np.loadtxt(self.path)
                # Assume m/z is in column 1 and intensity column 2
                mz = data[:, 0]
                intensity = data[:, 1]
                # Look for scans in column 3
                try:
                    scans = data[:, 2]
                except:
                    # If not found, assume all are scan 1
                    scans = np.ones_like(mz)
            except:
                # More complex text file from Jarrold Lab
                data = np.genfromtxt(path, dtype=np.str, comments=None)
                mzkey = "m/z_Lin_Reg"
                intkey = "Charge"
                mzcol = np.argmax(data[0] == mzkey)
                intcol = np.argmax(data[0] == intkey)
                mz = data[1:, mzcol].astype(np.float)
                intensity = data[1:, intcol].astype(np.float)
                scans = np.arange(len(mz))
            # Don't do post-processing for thermo data
            self.thermodata = False

        elif extension.lower() == ".csv":
            # Load text file
            data = np.genfromtxt(self.path, delimiter=",")
            # Assume m/z is in column 1 and intensity column 2
            mz = data[:, 0]
            intensity = data[:, 1]
            # Look for scans in column 3
            try:
                scans = data[:, 2]
            except:
                # If not found, assume all are scan 1
                scans = np.ones_like(mz)
            # Don't do post-processing for thermo data
            self.thermodata = False

        elif extension.lower() == ".bin":
            # Load numpy compressed file
            data = np.fromfile(self.path)
            try:
                data = data.reshape((int(len(data) / 3), 3))
            except:
                data = data.reshape((int(len(data) / 2)), 2)
            # Assume m/z is in column 1 and intensity column 2
            mz = data[:, 0]
            intensity = data[:, 1]
            # Look for scans in column 3
            try:
                scans = data[:, 2]
            except:
                # If not found, assume all are scan 1
                scans = np.ones_like(mz)
            # Don't do post-processing for thermo data
            self.thermodata = False

        elif extension.lower() == ".npz":
            # Load numpy compressed file
            data = np.load(self.path)['data']
            # Assume m/z is in column 1 and intensity column 2
            mz = data[:, 0]
            intensity = data[:, 1]
            # Look for scans in column 3
            try:
                scans = data[:, 2]
            except:
                # If not found, assume all are scan 1
                scans = np.ones_like(mz)
            # Don't do post-processing for thermo data
            self.thermodata = False

        else:
            print("Unrecognized file type:", self.path)
            return 0

        # Post processing if data is from raw or mzML
        # Ignored if text file input
        if self.thermodata:
            scans = np.concatenate([s * np.ones(len(data[i])) for i, s in enumerate(self.scans)])
            mz = np.concatenate([d[:, 0] for d in data])
            intensity = np.concatenate([d[:, 1] * self.it[i] / 1000. for i, d in enumerate(data)])

        # Create data array
        self.darray = np.transpose([mz, intensity, scans])
        # Filter out only the data with positive intensities
        boo1 = self.darray[:, 1] > 0
        self.darray = self.darray[boo1]
        # Define the noise level as the median of the data intensities
        self.noise = Gmax2(self.darray)
        # Create the filtered array (farray) object
        self.farray = deepcopy(self.darray)
        self.data.rawdata = self.darray[:, :2]

        # Check for empty data
        if ud.isempty(self.darray):
            print("Error: Data Array is Empty")
            print("Likely an error with data conversion")
            raise ImportError

        # Get the min and max m/z value
        self.config.minmz = np.amin(mz)
        self.config.maxmz = np.amax(mz)

        # Create the npz file of the extracted values if it doens't exist
        if not os.path.isfile(self.config.cdrawextracts):
            try:
                np.savez_compressed(self.config.cdrawextracts, data=self.darray)
            except Exception as e:
                pass
        # Load the config if you can find it
        if os.path.isfile(self.config.confname):
            self.load_config(self.config.confname)
        else:
            self.export_config()

        print("Read File Length: ", len(self.farray), "Noise: ", self.noise, "Time:", time.perf_counter() - starttime)

    def before_open(self):
        """
        Creates the initial blank self.pks and self.data objects. Creates the _unidecfiles folder if needed.
        Sets the default file names. If it finds raw data already in the numpy compressed format, it switches the path to that.
        :return: None
        """
        # Create blank peaks and data objects
        self.pks = peakstructure.Peaks()
        self.data = unidecstructure.DataContainer()

        # Get the directory and file names
        file_directory = os.path.dirname(self.path)
        file_name = os.path.basename(self.path)
        # Handle Paths
        self.config.filename = self.path
        self.config.dirname = file_directory

        # Change paths to unidecfiles folder
        dirnew = os.path.splitext(self.path)[0] + "_unidecfiles"
        if not os.path.isdir(dirnew):
            os.mkdir(dirnew)
        self.config.udir = dirnew
        # Default file names
        basename = os.path.split(os.path.splitext(file_name)[0])[1]
        self.config.outfname = os.path.join(self.config.udir, basename)
        self.config.extension = os.path.splitext(self.config.filename)[1]
        self.config.default_file_names()

        # Look for already processed data in the form of an npz file and load it if it exists for speed.
        if os.path.isfile(self.config.cdrawextracts):
            print("Raw data found:", self.config.cdrawextracts)
            self.path = self.config.cdrawextracts

    def process_data(self, transform=True):
        """
        Main function for processing CDMS data, includes filtering, converting intensity to charge, histogramming,
        processing the histograms, and transforming (if specified). Transforming is sometimes unnecessary, which is why
        it can be turned off for speed.

        :param transform: Sets whether to transform the data from m/z to mass. Default True.
        :return: None
        """
        starttime = time.perf_counter()
        # Copy filtered array and delete peaks.
        self.farray = deepcopy(self.darray)
        self.pks = peakstructure.Peaks()
        print("Filtering m/z range:", self.config.minmz, self.config.maxmz, "Start Length:", len(self.farray))
        self.filter_mz(mzrange=[self.config.minmz, self.config.maxmz])
        print("Filtering centroids:", self.config.CDres, "Start Length:", len(self.farray))
        self.filter_centroid_all(self.config.CDres)
        print("Filtering Charge range:", self.config.startz, self.config.endz, "Start Length:", len(self.farray))
        self.filter_z(zrange=[self.config.startz, self.config.endz + 1])

        print("Converting From Intensity to Charge. Slope:", self.config.CDslope, "Start Length:", len(self.farray))
        self.convert(slope=self.config.CDslope)

        print("Creating Histogram Bins:", self.config.mzbins, self.config.CDzbins, "Start Length:", len(self.farray))
        self.histogram(mzbins=self.config.mzbins, zbins=self.config.CDzbins)

        if len(self.harray) > 0:
            self.hist_data_prep()
            print("Transforming m/z to mass:", self.config.massbins, "Start Length:", len(self.farray))
            if transform:
                self.transform(massbins=self.config.massbins)
                self.unprocessed = deepcopy(self.data.massdat)
        else:
            print("ERROR: Empty histogram array on process")
            return 0
        print("Process Time:", time.perf_counter() - starttime)

    def filter_int(self, int_range):
        """
        Filter the self.farray to include only intensities within the int_range.

        :param int_range: list or array with int_range[0] as the minimum intensity and int_range[1] as the maximum
        :return: None
        """
        if int_range is not None:
            boo1 = self.farray[:, 1] > int_range[0]
            boo2 = self.farray[:, 1] < int_range[1]
            boo3 = np.logical_and(boo1, boo2)
            self.farray = self.farray[boo3]
        return self.farray

    def filter_z(self, zrange, slope=None):
        """
        Function to filter intensities based on their eventual charge state. Calculates int_range from zrange based on the slope.
        Calls self.filter_int from the calculated int_range.

        :param zrange: list or array with zrange[0] as the minimum charge state and zrange[1] as the maximum.
        :param slope: Optional parameter to specify the slope. If None (default), will use self.config.CDslope
        :return: None
        """
        if slope is not None:
            self.config.CDslope = slope
        else:
            slope = self.config.CDslope

        # If slope is negative (old dev settings) or subtype is 0, multiply the slope by the noise ratio.
        if slope < 0 or self.config.subtype == 0:
            slope = np.abs(slope) * self.noise
        # The int_range is the zrange * the slope
        int_range = np.array(zrange) * slope
        # Run filter_int with the int_range calculated from zrange
        self.filter_int(int_range=int_range)

    def filter_mz(self, mzrange=None):
        """
        Filter the self.farray to include only m/z value within the mzrange.

        :param mzrange: list or array with mzrange[0] as the minimum m/z and mzrange[1] as the maximum
        :return: self.farray, the filtered data array
        """
        if mzrange is not None:
            boo1 = self.farray[:, 0] > mzrange[0]
            boo2 = self.farray[:, 0] < mzrange[1]
            boo3 = np.logical_and(boo1, boo2)
            self.farray = self.farray[boo3]
        return self.farray

    def filter_centroid_all(self, mz_threshold=1):
        """
        Filter the self.farray to remove ions with nearby ions. See Worner et Al., Nat. Methods, 2020.

        Removed all the resolution settings of Worner et Al in favor of a simple single mz_threshold.

        :param mz_threshold: Distance cutoff. Two points in the same scan closer than this will be removed.
        :return: None
        """
        if mz_threshold > 0:
            # farray2 = []
            # for i, s in enumerate(self.scans):
            #    sbool = self.farray[:, 2] == s
            #    farray2.append(filter_centroid_scan(self.farray[sbool], mz_threshold=mz_threshold))
            # self.farray = np.concatenate(farray2)
            self.farray = filter_centroid_const(self.farray, mz_threshold=mz_threshold)
        return self.farray

    def simp_convert(self, y):
        if self.config.CDslope > 0 and self.config.subtype == 1:
            y = y / self.config.CDslope
        elif self.config.CDslope < 0 or self.config.subtype == 0:
            y = y / (np.abs(self.config.CDslope) * self.noise)
        return y

    def convert(self, slope=None):
        if slope is not None:
            self.config.CDslope = slope
        else:
            slope = self.config.CDslope

        if slope > 0 and self.config.subtype == 1:
            self.zarray = self.farray[:, 1] / slope
        elif slope < 0 or self.config.subtype == 0:
            self.zarray = self.farray[:, 1] / (np.abs(slope) * self.noise)

    def histogram(self, mzbins=1, zbins=1):
        if mzbins < 0.001:
            print("Error, mzbins too small. Changing to 1", mzbins)
            mzbins = 1
            self.config.mzbins = 1
        self.config.mzbins = mzbins
        self.config.CDzbins = zbins
        if len(self.farray) == 0:
            print("ERROR: Empty Filtered Array, check settings")
            self.harray = []
            return 0
        mzrange = [np.floor(np.amin(self.farray[:, 0])), np.amax(self.farray[:, 0])]
        zrange = [np.floor(np.amin(self.zarray)), np.amax(self.zarray)]
        mzaxis = np.arange(mzrange[0] - mzbins / 2., mzrange[1] + mzbins / 2, mzbins)
        # Weird fix to make this axis even is necessary for CuPy fft for some reason...
        if len(mzaxis) % 2 == 1:
            mzaxis = np.arange(mzrange[0] - mzbins / 2., mzrange[1] + 3 * mzbins / 2, mzbins)
        zaxis = np.arange(zrange[0] - zbins / 2., zrange[1] + zbins / 2, zbins)

        self.harray, self.mz, self.ztab = np.histogram2d(self.farray[:, 0], self.zarray, [mzaxis, zaxis])
        self.mz = self.mz[1:] - mzbins / 2.
        self.ztab = self.ztab[1:] - zbins / 2.
        self.data.ztab = self.ztab
        self.harray = np.transpose(self.harray)
        self.harray /= np.amax(self.harray)

        self.X, self.Y = np.meshgrid(self.mz, self.ztab, indexing='xy')
        self.mass = (self.X - self.config.adductmass) * self.Y

    def hist_data_prep(self):
        if self.config.smooth > 0 or self.config.smoothdt > 0:
            print("Histogram Smoothing:", self.config.smooth, self.config.smoothdt)
            self.harray = IM_functions.smooth_2d(self.harray, self.config.smoothdt, self.config.smooth)

        if self.config.intthresh > 0:
            print("Histogram Intensity Threshold:", self.config.intthresh)
            self.hist_int_threshold(self.config.intthresh)
        if self.config.reductionpercent > 0:
            print("Histogram Data Reduction:", self.config.reductionpercent)
            self.hist_datareduction(self.config.reductionpercent)

        if self.config.subbuff > 0 or self.config.subbufdt > 0:
            print("Histogram Background Subtraction:", self.config.subbuff, self.config.subbufdt)
            self.harray = IM_functions.subtract_complex_2d(self.harray.transpose(), self.config).transpose()

        self.data.data2 = np.transpose([self.mz, np.sum(self.harray, axis=0)])
        np.savetxt(self.config.infname, self.data.data2)
        pass

    def hist_int_threshold(self, int_threshold):
        boo1 = self.harray > int_threshold
        self.harray *= boo1

    def hist_datareduction(self, red_per):
        sdat = np.sort(np.ravel(self.harray))
        index = round(len(sdat) * red_per / 100.)
        cutoff = sdat[index]
        self.hist_int_threshold(cutoff)

    def hist_mass_filter(self, massrange=None):
        # Get values from config if not supplied
        if massrange is None:
            massrange = [self.config.masslb, self.config.massub]

        # Filter values
        boo1 = self.mass < massrange[0]
        boo2 = self.mass > massrange[1]
        boo3 = np.logical_or(boo1, boo2)
        # Set values outside range to 0
        self.harray[boo3] = 0

    def hist_nativeZ_filter(self, nativeZrange=None):
        # Get values from config if not supplied
        if nativeZrange is None:
            nativeZrange = [self.config.nativezlb, self.config.nativezub]

        if nativeZrange != [-1000, 1000]:
            # Find predicted native charge state
            nativeZ = ud.predict_charge(self.mass)
            # Find distance from predicted charge state
            offset = self.Y - nativeZ

            # Filter values
            boo1 = offset < nativeZrange[0]
            boo2 = offset > nativeZrange[1]
            boo3 = np.logical_or(boo1, boo2)
            # Set values outside range to 0
            self.harray[boo3] = 0

    def transform(self, massbins=100):
        # Test for if array is empty and error if so
        if len(self.harray) == 0:
            print("ERROR: Empty histogram array on transform")
            return 0

        # filter out zeros
        boo1 = self.harray > 0
        mass = self.mass[boo1]

        # Test for if array is empty and error if so
        if ud.isempty(mass):
            print("ERROR: Empty histogram array on transform")
            return 0

        # Find the max and min and create the new linear mass axis
        minval = np.amax([np.amin(mass) - self.config.massbins * 3, self.config.masslb])
        maxval = np.amin([np.amax(mass) + self.config.massbins * 3, self.config.massub])
        minval = round(minval / self.config.massbins) * self.config.massbins  # To prevent weird decimals
        massaxis = np.arange(minval, maxval, massbins)

        # Create the mass grid
        self.data.massgrid = []
        for i in range(len(self.ztab)):
            d = self.harray[i]
            boo1 = d > 0
            newdata = np.transpose([self.mass[i][boo1], d[boo1]])
            if len(newdata) < 2:
                self.data.massgrid.append(massaxis * 0)
            else:
                if self.config.poolflag == 1:
                    massdata = ud.linterpolate(newdata, massaxis)
                else:
                    massdata = ud.lintegrate(newdata, massaxis)
                self.data.massgrid.append(massdata[:, 1])
        self.data.massgrid = np.transpose(self.data.massgrid)
        # Create the linearized mass data by integrating everything into the new linear axis
        self.data.massdat = np.transpose([massaxis, np.sum(self.data.massgrid, axis=1)])
        np.savetxt(self.config.massdatfile, self.data.massdat)
        # Ravel the massgrid to make the format match UniDec
        self.data.massgrid = np.ravel(self.data.massgrid)
        # Create the data2 and mzgrid objects from the histogram array for compatiblity with UniDec functions
        self.data.data2 = np.transpose([self.mz, np.sum(self.harray, axis=0)])
        self.data.zdat = np.transpose([self.ztab, np.sum(self.harray, axis=1)])
        self.data.mzgrid = np.transpose(
            [np.ravel(self.X.transpose()), np.ravel(self.Y.transpose()), np.ravel(self.harray.transpose())])

    def make_kernel(self, mzsig=None, zsig=None):
        """
        Sets up the deconvolution kernels based on the provided mzsig and zsig values, which specify the peak FWHM in m/z and z.
        :param mzsig: FWHM for m/z in units of Th.
        :param zsig: FWHM for charge. This is also the uncertainty for the charge assignment.
        :return: None
        """
        if mzsig is not None:
            self.config.mzsig = mzsig
        else:
            mzsig = self.config.mzsig
        if zsig is not None:
            self.config.csig = zsig
        else:
            zsig = self.config.csig

        X, Y = np.meshgrid(self.mz, self.ztab, indexing='xy')
        self.kernel = np.zeros_like(X)
        self.kernel[0, 0] = 1
        if mzsig > 0:
            self.mkernel = np.zeros_like(X)
            self.mkernel[0] = fitting.psfit(X[0], mzsig, np.amin(self.mz), psfun=self.config.psfun) \
                              + fitting.psfit(X[0], mzsig, np.amax(self.mz) + self.config.mzbins,
                                              psfun=self.config.psfun)
            if zsig > 0:
                self.kernel = fitting.psfit(X, mzsig, np.amin(self.mz), psfun=self.config.psfun) \
                              + fitting.psfit(X, mzsig, np.amax(self.mz) + self.config.mzbins, psfun=self.config.psfun)
                self.kernel *= fitting.psfit(-Y, zsig, -np.amin(self.ztab), psfun=self.config.psfunz) \
                               + fitting.psfit(-Y, zsig, -(np.amax(self.ztab) + self.config.CDzbins),
                                               psfun=self.config.psfunz)
            else:
                self.kernel = deepcopy(self.mkernel)
        elif zsig > 0 and mzsig <= 0:
            self.mkernel = None
            self.kernel[:, 0] = fitting.psfit(-Y[:, 0], zsig, -np.amin(self.ztab), psfun=self.config.psfunz) \
                                + fitting.psfit(-Y[:, 0], zsig, -(np.amax(self.ztab) + self.config.CDzbins),
                                                psfun=self.config.psfunz)
        else:
            self.mkernel = None

        if self.config.psig > 0:
            self.mkernel2 = np.zeros_like(X)
            self.mkernel2[0] = fitting.psfit(X[0], self.config.psig, np.amin(self.mz), psfun=self.config.psfun) \
                               + fitting.psfit(X[0], self.config.psig, np.amax(self.mz) + self.config.mzbins,
                                               psfun=self.config.psfun)
            self.mkernel2 /= np.amax(self.mkernel2)

        self.kernel /= np.amax(self.kernel)
        # Create the flipped kernel for the correlation. Roll so that the 0,0 point is still the highest
        self.ckernel = np.roll(np.flip(self.kernel), (1, 1), axis=(0, 1))

        if mzsig > 0:
            self.mkernel /= np.amax(self.mkernel)

    def setup_zsmooth(self):
        # Setup Grids for  Z+1, and Z-1
        X, uY = np.meshgrid(self.mz, self.ztab + 1, indexing='xy')
        X, lY = np.meshgrid(self.mz, self.ztab - 1, indexing='xy')

        # Calculate m/z values for Z+1 and Z-1
        uppermz = (self.mass + uY) / uY
        lowermz = (self.mass + lY) / lY

        # Calculate the indexes for where to find the Z+1 and Z-1 m/z values
        m1 = self.mz[0]
        m2 = self.mz[-1]
        lm = len(self.mz)

        # Calculate normal indexes
        indexes = np.arange(0, lm)
        normindexes = np.array([indexes for i in self.ztab]).astype(np.int)

        # Calculate upperindexes for Z+1
        upperindex = np.round(((uppermz - m1) / (m2 - m1)) * (lm - 1))
        upperindex[-1] = normindexes[-1]
        upperindex[upperindex < 0] = normindexes[upperindex < 0]
        upperindex[upperindex >= lm] = normindexes[upperindex >= lm]

        # Calculate lowerindexes for Z-1
        lowerindex = np.round(((lowermz - m1) / (m2 - m1)) * (lm - 1))
        lowerindex[0] = normindexes[0]
        lowerindex[lowerindex < 0] = normindexes[lowerindex < 0]
        lowerindex[lowerindex >= lm] = normindexes[lowerindex >= lm]
        # For both, use the normal index if it is out of range

        self.upperindex = np.array(upperindex, dtype=np.int)
        self.lowerindex = np.array(lowerindex, dtype=np.int)

    def filter_zdist(self, I, setup=True):
        if setup:
            self.setup_zsmooth()

        # Get the intensities of the Z+1 values
        upperints = xp.zeros_like(I)
        for i, row in enumerate(self.upperindex):
            if i + 1 != len(I):
                upperints[i] = I[i + 1, row]
            else:
                upperints[i] = I[i, row]

        # Get the intensities of the Z-1 values
        lowerints = xp.zeros_like(I)
        for i, row in enumerate(self.lowerindex):
            if i != 0:
                lowerints[i] = I[i - 1, row]
            else:
                lowerints[i] = I[i, row]

        floor = self.config.zzsig
        if floor > 0:
            I = xp.clip(xp.exp(
                xp.mean(xp.asarray([xp.log(upperints + floor), xp.log(lowerints + floor), xp.log(I + floor)]), axis=0))
                        - floor, 0, None)
        else:
            ratio = xp.abs(floor)
            I = (upperints * ratio + I + lowerints * ratio) / 3.
        return I

    def setup_msmooth(self):
        mzoffsets = self.config.molig / self.ztab
        indexoffsets = np.round(mzoffsets / self.config.mzbins)
        lmz = len(self.mz)
        indexes = np.arange(0, lmz)
        upperindexes = np.array([indexes + i for i in indexoffsets]).astype(np.int)
        lowerindexes = np.array([indexes - i for i in indexoffsets]).astype(np.int)
        normindexes = np.array([indexes for i in indexoffsets]).astype(np.int)

        upperindexes[upperindexes < 0] = normindexes[upperindexes < 0]
        lowerindexes[lowerindexes < 0] = normindexes[lowerindexes < 0]
        upperindexes[upperindexes >= lmz] = normindexes[upperindexes >= lmz]
        lowerindexes[lowerindexes >= lmz] = normindexes[lowerindexes >= lmz]

        self.mupperindexes = upperindexes
        self.mlowerindexes = lowerindexes

    def filter_mdist(self, I, setup=True):
        if setup:
            self.setup_msmooth()

        upperints = xp.array([d[self.mupperindexes[i]] for i, d in enumerate(I)])
        lowerints = xp.array([d[self.mlowerindexes[i]] for i, d in enumerate(I)])

        floor = self.config.msig
        if floor > 0:
            I = xp.clip(xp.exp(
                xp.mean(xp.array([xp.log(upperints + floor), xp.log(lowerints + floor), xp.log(I + floor)]),
                        axis=0)) - floor,
                        0, None)
        else:
            ratio = xp.abs(floor)
            I = (upperints * ratio + I + lowerints * ratio) / 3.

        return I

    def decon_core(self):
        """
        Core UniDec deconvolution function. Needs kernels already in place.
        :return: self.harray, the intensity array.
        """
        # Create a working array of intensity values
        I = deepcopy(self.harray)
        D = deepcopy(self.harray)
        if cuda:
            I = cp.asarray(I)
            D = cp.asarray(D)

        # Perform the FFTs for convolution and correlation kernels
        ftk = fft_fun(self.kernel)
        ftck = fft_fun(self.ckernel)
        if self.config.psig != 0:
            ftmk = fft_fun(self.mkernel2)

        # Set up the while loop
        i = 0
        diff = 1
        # Continue until i = max number of iterations or the relative difference is less than 0.0001
        while i < self.config.numit and diff > 0.0001:
            # If beta is not 0, add in Softmax with beta value
            if self.config.beta > 0:
                I = softmax(I, self.config.beta)

            # Point Smoothing
            if self.config.psig > 0:
                I = cconv2D_preB(I, ftmk)

            # Run the smooth charge state filter and smooth mass filter. Set up the dist if needed.
            if i == 0:
                setup = True
            else:
                setup = False

            if self.config.zzsig != 0:
                if self.config.CDzbins == 1: # Zdist smoothing currently only defined for unit charge bins
                    I = self.filter_zdist(I, setup)
                else:
                    print("Error: Charge Bins Size must be 1 for Charge State Smoothing")
            if self.config.msig != 0:
                I = self.filter_mdist(I, setup)

            # Classic Richardson-Lucy Algorithm here. Most the magic happens in this one line...
            if self.config.mzsig != 0 or self.config.csig != 0:
                newI = I * cconv2D_preB(safedivide(D, cconv2D_preB(I, ftk)), ftck)
                #newI = I * safedivide(D, cconv2D_preB(I, ftk))

                if i > 10:
                    # Calculate the difference and increment the counter to halt the while loop if needed
                    diff = np.sum((I - newI) ** 2) / np.sum(I)
                I = newI
            i += 1
            # print(i)
        print("Deconvolution iterations: ", i)
        # Normalize the final array
        I /= xp.amax(I)

        # Get the reconvolved data
        recon = cconv2D_preB(I, ftk)
        if cuda:
            recon = recon.get()
        # Get the fit data in 1D for the DScore calc
        self.data.fitdat = np.sum(recon, axis=0)
        self.data.fitdat /= np.amax(self.data.data2[:, 1]) / np.amax(self.data.fitdat)

        if self.config.mzsig > 0 and self.config.rawflag == 0:
            # Reconvolved/Profile: Reconvolves with the peak shape in the mass dimension only
            ftmk = fft_fun(self.mkernel)
            recon2 = cconv2D_preB(I, ftmk)
            if cuda:
                self.harray = recon2.get()
            else:
                self.harray = recon2
        else:
            # Raw/Centroid: Takes the deconvolved data straight
            if cuda:
                self.harray = I.get()
            else:
                self.harray = I

        return self.harray

    def run_deconvolution(self):
        """
        Function for running the full deconvolution sequence, including setup, pre-, and post-processing.

        :return: None
        """
        # Process data but don't transform
        self.process_data(transform=False)
        # Filter histogram to remove masses that are not allowed
        self.hist_mass_filter()
        # Filter histogram to remove charge states that aren't allowed based on the native charge state filter
        self.hist_nativeZ_filter()

        print("Running Deconvolution", self.config.mzsig, self.config.csig)
        starttime = time.perf_counter()
        # Make kernels for convolutions based on peak shapes
        self.make_kernel(self.config.mzsig, self.config.csig)
        # Run deconvolution
        self.decon_core()
        print("Deconvolution Time:", time.perf_counter() - starttime)
        # Transform m/z to mass
        self.transform(massbins=self.config.massbins)

    def extract_intensities(self, mass, minz, maxz, window=10):
        ztab = np.arange(minz, maxz + 1)
        mztab = (mass + ztab * self.config.adductmass) / ztab
        extracts = []
        windows = [-window, window]
        for i, z in enumerate(ztab):
            self.farray = deepcopy(self.darray)
            self.filter_mz(mzrange=windows + mztab[i])

            ext = self.filter_centroid_all(1)

            int_range = [self.noise*1.5, 3000]
            ext = self.filter_int(int_range)
            if not ud.isempty(self.farray):
                median = np.median(self.farray[:, 1])
                stddev = 100
                int_range = np.array([-stddev, stddev]) + median
                ext = self.filter_int(int_range)

                ext = ext[:, 1]
                ext = np.transpose([np.ones_like(ext) * z, ext])
                if i == 0:
                    extracts = ext
                else:
                    extracts = np.concatenate((extracts, ext), axis=0)
                pass
        snextracts = deepcopy(extracts)
        snextracts[:, 1] = snextracts[:, 1] / self.noise
        return extracts, snextracts

    def get_fit(self, extracts):
        fits = curve_fit(slopefunc, extracts[:, 0], extracts[:, 1])[0]
        x = np.unique(extracts[:, 0])
        fitdat = x * fits[0]
        return fits, np.transpose([x, fitdat])

    def plot_add(self):
        plt.subplot(132)
        plt.plot(self.mz, np.sum(self.harray, axis=0) / np.amax(np.sum(self.harray, axis=0)))
        plt.subplot(133)
        plt.plot(self.ztab, np.sum(self.harray, axis=1) / np.amax(np.sum(self.harray, axis=1)))

    def plot_hist(self):
        plt.subplot(131)
        plt.contourf(self.mz, self.ztab, self.harray, 100)
        plt.subplot(132)
        plt.plot(self.mz, np.sum(self.harray, axis=0) / np.amax(np.sum(self.harray, axis=0)))
        plt.subplot(133)
        plt.plot(self.ztab, np.sum(self.harray, axis=1) / np.amax(np.sum(self.harray, axis=1)))
        plt.show()

    def sim_dist(self):
        self.config.mzsig = 1000
        self.config.csig = 0.2
        self.config.rawflag = 1
        mzmean = self.mz[round(len(self.mz) / 2)]
        zmean = self.ztab[round(len(self.ztab) / 2)]
        mzsig = self.config.mzsig
        zsig = self.config.csig
        X, Y = np.meshgrid(self.mz, self.ztab, indexing='ij')
        self.harray = fitting.psfit(X, mzsig, mzmean, psfun=self.config.psfun)
        self.harray *= fitting.psfit(Y, zsig, zmean, psfun=self.config.psfunz)
        self.harray = np.transpose(self.harray)
        self.harray /= np.amax(self.harray)


if __name__ == '__main__':
    eng = UniDecCD()
    path = "C:\\Data\\CDMS\\spike trimer CDMS data.csv"
    eng.open_file(path)
    eng.process_data()
    eng.sim_dist()
    eng.plot_add()
    maxtup = np.unravel_index(np.argmax(eng.harray, axis=None), eng.harray.shape)
    print(maxtup)
    eng.make_kernel(eng.config.mzsig, eng.config.csig)
    #eng.harray = np.roll(eng.ckernel, maxtup, axis=(0, 1))
    #eng.plot_hist()
    #exit()
    eng.decon_core()
    print(np.unravel_index(np.argmax(eng.harray, axis=None), eng.harray.shape))
    eng.plot_hist()
    exit()

    eng = UniDecCD()
    eng.mz = np.array([5000, 6000, 7000, 8000, 9000])
    eng.ztab = np.array([12, 13, 14])
    eng.make_kernel(10, 2)
    print(eng.kernel)

    exit()
    path = "C:\\Data\\CDMS\\20210309_MK_ADH_pos_CDMS_512ms_5min_50ms_pressure01.RAW"
    eng = UniDecCD()
    eng.open_file(path)

    extracts, snextracts = eng.extract_intensities(147720, 21, 27)

    fits, fitdat = eng.get_fit(extracts)
    print(fits)
    snfits, snfitdat = eng.get_fit(snextracts)
    print(snfits)

    plt.subplot(121)
    plt.hist2d(extracts[:, 0], extracts[:, 1], cmap="nipy_spectral")
    plt.plot(fitdat[:, 0], fitdat[:, 1], color="red")
    plt.subplot(122)
    plt.hist2d(snextracts[:, 0], snextracts[:, 1], cmap="nipy_spectral")
    plt.plot(snfitdat[:, 0], snfitdat[:, 1], color="red")
    plt.show()

    # eng.run_deconvolution()
    exit()

    path = "C:\Data\CDMS\\20210309_MK_ADH_pos_CDMS_512ms_5min_50ms_pressure01_unidecfiles\\20210309_MK_ADH_pos_CDMS_512ms_5min_50ms_pressure01_rawdata.txt"
    data = np.loadtxt(path)
    noise = np.median(data[:, 1])
    print(noise)

    plt.plot(data[:, 0], data[:, 1])
    plt.axhline(noise, color='r')
    plt.hlines(noise, 4000, 14000, color='r')
    plt.show()

    exit()
    eng = UniDecCD()
    eng.mz = np.array([5000, 6000, 7000, 8000, 9000])
    eng.ztab = np.array([12, 13, 14])

    eng.config.mzbins = 1000
    eng.setup_zsmooth()
    eng.harray = eng.mass
    # eng.filter_zdist()
    exit()
    # path = "Z:\\Group Share\\Marius Kostelic\\CD-MS\\02242021\\02242021_MK_ADH_ACN_50_IST_10min_Aqu_CD-MS.RAW"
    # mzrange = [5000, 10000]
    # irange = [200, 800]
    path = "Z:\\Group Share\\Marius Kostelic\\CD-MS\\02242021 Data Set\\02242021_MK_BSA__CD-MS_Aqu_ACN_10min.RAW"
    mzrange = [3000, 7000]
    irange = [100, 600]

    path = "Z:\\Group Share\Marius Kostelic\\CD-MS\\03082021\\20210308_MK_GroEL_CDMS_50msinject_10min.RAW"
    mzrange = [9000, 13000]
    irange = [1000, 2000]

    eng = UniDecCD()
    eng.open_file(path)
    eng.filter_mz(mzrange=mzrange)
    eng.filter_int(int_range=irange)
    eng.convert()
    eng.histogram()
    eng.make_kernel()
    eng.decon_core()
    eng.transform()
    eng.plot_hist()
