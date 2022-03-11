# -*- coding: utf-8 -*-
 
import clr
import os.path as Path
import pandas as pd
import numpy as np
import bisect


pathtothisfile = Path.dirname(__file__)

dlls = ['./dlls/ThermoFisher.CommonCore.Data', './dlls/ThermoFisher.CommonCore.RawFileReader',
        'dlls/ThermoFisher.CommonCore.BackgroundSubtraction', 'dlls/ThermoFisher.CommonCore.MassPrecisionEstimator']

for dll in dlls:
    testpath = dll 
    print(testpath)
    if Path.isfile(testpath):
        print("founded file")
        clr.AddReference(testpath)
    else:
        try:
            import sys
            sys.path.append(pathtothisfile)
            clr.AddReference(dll)
        except:
            clr.AddReference(dll)


from ThermoFisher.CommonCore.RawFileReader import RawFileReaderAdapter
from ThermoFisher.CommonCore.Data.Business import (ChromatogramSignal, ChromatogramTraceSettings,
                                                   DataUnits, Device, GenericDataTypes, SampleType,
                                                   Scan, TraceType, Range)
from ThermoFisher.CommonCore.Data.FilterEnums import IonizationModeType, MSOrderType
from ThermoFisher.CommonCore.Data.Interfaces import (IChromatogramSettings, IScanEventBase,
                                                     IScanFilter, RawFileClassification,
                                                     IRawDataPlus)
from ThermoFisher.CommonCore.Data import ToleranceUnits
from ThermoFisher.CommonCore.Data import Extensions


class ThermoRawReader():
    """
    This class creates an object which has functions to parse information of 
    Thermo RAW files.
    An instance is created by providing the path the Thermo RAW file is saved   
    """
    
    def __init__(self,path,color=None,condition=None):
        self.source=RawFileReaderAdapter.FileFactory(path)
        self.path=path
        self.source.SelectInstrument(Device.MS, 1)
        self.minStartTime=self.source.RunHeaderEx.StartTime
        self.maxStartTime=self.source.RunHeaderEx.EndTime
        self.color=color
        self.condition=condition
        self.baseName=Path.basename(path)
        self.numOfSpectra=self.source.RunHeaderEx.SpectraCount
    
    
    def close(self):
        """
        Use this function to close a raw file.  
        """
        self.source.Dispose()
        return

    def getMetaData(self):
        """
        This function returns a tuple containing information about:
            Instrument method
            Injection volume
            Date     
            Number of scans
            Number of MS1 scans
            Number of MS2 scans
            Number of MS3 scans
        """

        CreationDate=str(self.source.get_CreationDate())
        scanInformation=self.getScanInformation()
        instrumentMethod=self.source.SampleInformation.InstrumentMethodFile
        injectionVolume=self.source.SampleInformation.InjectionVolume
        a=scanInformation.groupby("MassOrder").apply(len)
        numberMS1=0
        numberMS2=0
        numberMS3=0
        for n,item in enumerate(a):
            if a.index[n]==1:
                numberMS1=item
            elif a.index[n]==2:
                numberMS2=item
            elif a.index[n]==3:
                numberMS3=item
        
        print(self)
        
        return (instrumentMethod,injectionVolume,CreationDate,
                self.numOfSpectra,numberMS1,numberMS2,numberMS3)   
        
        
        
    def getScanInformation(self):
        """
        This function returns a pandas dataframe containing following columns:
            scanNumber
            Massorder (MS1,M2,...)
            Starttime
        """
        rows=list()        
        for scan in range(1,self.numOfSpectra+1):
            info=self.source.GetFilterForScanNumber(scan)
            massOrder=info.MSOrder
            StartTime=self.source.RetentionTimeFromScanNumber(scan)
            rows.append([scan,massOrder,StartTime])
        df=pd.DataFrame(rows,columns=['scanNumber','MassOrder','StartTime'])
        df.name="ScanInformation@"+self.baseName
        return df
    
    
    def getPrecursorInformation(self):
        """
        This function returns a pandas dataframe containing information about all tandem mass
        spectra in one run. The dataframe includes following columns:
            scanNumber
            PrecursorMass
            StartTime
            TIC            
        """
        rows=list()
        for scan in range(1,self.numOfSpectra+1):
            info=self.source.GetFilterForScanNumber(scan)
            massOrder=info.MSOrder
            if massOrder>1:
                scanEvent=self.source.GetScanEventForScanNumber(scan)
                reaction=scanEvent.Reactions[0]
                precursor_mz=reaction.PrecursorMass
                StartTime=self.source.RetentionTimeFromScanNumber(scan)
                trailer=self.source.GetTrailerExtraInformation(scan)
                monoisotopicMass=float(trailer.Values[list(trailer.Labels).index('Monoisotopic M/Z:')])
                chargeState=int(trailer.Values[list(trailer.Labels).index('Charge State:')])

                rows.append([scan,precursor_mz,StartTime,monoisotopicMass,chargeState])
        df=pd.DataFrame(rows,columns=['scanNumber','PrecursorMass','StartTime','monoisotopic m/z','Charge State'])
        return df

    def getXIC(self,massrange,startTime=0,endTime=0,smooth=True,scanFilter="Full ms"):
        """
        Description of the parameters:
               name        type                description
               massrange   string              for example "201.01-203.4" or "201.01-203.4,502.1-503.2"
               startTime   float               
               endTime     float               l
               threshould  float               Error in ppm
        
        This function returns a pandas dataframe containing following columns:
            RT   retention time
            intensity
        """
        if startTime>endTime:
            raise IOError("startTime must be lower than endTime!")

        
        StartScan=self.source.ScanNumberFromRetentionTime(startTime)
        EndScan=self.source.ScanNumberFromRetentionTime(endTime)
        
        ls_range=list()
        
        for item in massrange.split(","):
            startMZ,endMZ=item.split("-")
            
            ls_range.append(Range.Create(float(startMZ),float(endMZ)))
        
        settings=ChromatogramTraceSettings(scanFilter,ls_range)        
                
        xic_data = self.source.GetChromatogramData([settings], StartScan, EndScan)
        xic_trace = ChromatogramSignal.FromChromatogramData(xic_data)[0]

        try:
            signal=np.dstack((list(xic_trace.Times),list(xic_trace.Intensities)))[0]
        except:
            df=pd.DataFrame()
            df['RT']=[startTime,endTime]
            df['intensity']=[0,0]
            return(df)
            
# =============================================================================
#         if smooth:       
#             signal=moveAverage(signal,0.1,2)
# =============================================================================
        
        df=pd.DataFrame()
        df['RT']=signal[:,0]
        df['intensity']=signal[:,1]
        return(df)

    def getTIC(self,startTime=0,endTime=0,scanFilter="Full ms"):
        """
        Description of the parameters:
               name        type                description
               startTime   float               
               endTime     float               
               smooth      bool
        
        This function returns a pandas dataframe containing following columns:
            RT          retention time
            intensity
        
        """
        if startTime>endTime:
            raise IOError("startTime must be lower than endTime!")
        
        StartScan=-1
        EndScan=-1
        if startTime:
            StartScan=self.source.ScanNumberFromRetentionTime(startTime)
                
        if endTime:
            EndScan=self.source.ScanNumberFromRetentionTime(endTime)

        settings=ChromatogramTraceSettings(TraceType.TIC)
        settings.set_Filter(scanFilter)
        
        tic_data = self.source.GetChromatogramData([settings], StartScan, EndScan)
        tic_trace = ChromatogramSignal.FromChromatogramData(tic_data)[0]
        

        try:
            signal=np.dstack((list(tic_trace.Times),list(tic_trace.Intensities)))[0]
        except:
            df=pd.DataFrame()
            if not startTime:
                startTime=self.minStartTime
            if not endTime:
                endTime=self.maxStartTime
            df['RT']=[startTime,endTime]
            df['intensity']=[0,0]
            return(df)
# =============================================================================
#         if smooth:       
#             signal=moveAverage(signal,0.1,2)
# =============================================================================
        df=pd.DataFrame()
        df['RT']=signal[:,0]
        df['intensity']=signal[:,1]
        return(df)

    
    def getUV(self,startTime=0,endTime=0,smooth=True):
        """
        Description of the parameters:
               name        type                description
               massrange   string              for example "201.01-203.4" or "201.01-203.4,502.1-503.2"
               startTime   float               
               endTime     float               l
               threshould  float               Error in ppm        
        
        This function returns a pandas dataframe containing following columns:
            RT          retention time
            intensity
        
        """
        if startTime>endTime:
            raise IOError("startTime must be lower than endTime!")
        self.source.SelectInstrument(Device.UV, 1)
        StartScan=-1
        EndScan=-1
        if startTime:
            StartScan=self.source.ScanNumberFromRetentionTime(startTime)
                
        if endTime:
            EndScan=self.source.ScanNumberFromRetentionTime(endTime)

        settings=ChromatogramTraceSettings(TraceType.Analog1)
        
        UV_data = self.source.GetChromatogramData([settings], StartScan, EndScan)
        UV_trace = ChromatogramSignal.FromChromatogramData(UV_data)[0]
        

        try:
            signal=np.dstack((list(UV_trace.Times),list(UV_trace.Intensities)))[0]
        except:
            df=pd.DataFrame()
            if not startTime:
                startTime=self.minStartTime
            if not endTime:
                endTime=self.maxStartTime
            df['RT']=[startTime,endTime]
            df['intensity']=[0,0]
            return(df)
# =============================================================================
#         if smooth:       
#             signal=moveAverage(signal,0.1,2)
# =============================================================================
        df=pd.DataFrame()
        df['RT']=signal[:,0]
        df['intensity']=signal[:,1]
        self.source.SelectInstrument(Device.MS, 1)
        return(df)


    def getMS1spectraByScanNumber(self,scanNumber):
        """
        Define the scan number of the MS1 spectra
        This function returns a pandas dataframe containing following columns:
            mz          
            intensity  
        
        """
        scan_stats = self.source.GetScanStatsForScanNumber(scanNumber)
        if scan_stats.IsCentroidScan: raise IOError("No profile data for scan %s" % scanNumber)
        
        try:
            scan = self.source.GetSegmentedScanFromScanNumber(scanNumber, scan_stats)
        except:
            df=pd.DataFrame(columns=['mz','intensity'])
            return(df)
        df=pd.DataFrame()
        df['mz']=list(scan.Positions)
        df['intensity']=list(scan.Intensities)
        return(df) 
        
        
    def getMS1spectraByRT(self,RT):
        """
        Define the retention time in minutes
        This function returns a pandas dataframe containing following columns:
            mz          
            intensity  
        
        """        
        if RT<self.minStartTime:
            RT=self.minStartTime

        if RT>self.maxStartTime:
            RT=self.maxStartTime  

        scanNumber=self.source.ScanNumberFromRetentionTime(RT)
        info=self.source.GetFilterForScanNumber(scanNumber)
        massOrder=info.MSOrder
        while massOrder>1:
            scanNumber=scanNumber-1
            info=self.source.GetFilterForScanNumber(scanNumber)
            massOrder=info.MSOrder
                    
        scan_stats = self.source.GetScanStatsForScanNumber(scanNumber)
        
        try:
            scan = self.source.GetSegmentedScanFromScanNumber(scanNumber, scan_stats)
        except:
            df=pd.DataFrame(columns=['mz','intensity'])
            return(df,scanNumber)
        df=pd.DataFrame()
        df['mz']=list(scan.Positions)
        df['intensity']=list(scan.Intensities)
        return(df,scanNumber) 
        
    
    def getMSLabelByScanNumber(self,scanNumber):
        """
        This function returns a pandas DataFrame containing following MS labels:
            mz
            intensity
            resolution
            Base
            noise
            charge
        
        Define the scanNumber of the spectra
        
        """    
        stream = self.source.GetCentroidStream(scanNumber, False)
        df=pd.DataFrame()
        df['mz']=list(stream.Masses)
        df['intensity']=list(stream.Intensities)
        df['resolution']=list(stream.Resolutions)
        df['Base']=list(stream.Baselines)
        df['noise']=list(stream.Noises)
        df['charge']=list(stream.Charges)
        
        return(df)


    def getMS2LabelByScanNumber(self,scanNumber):
        return(self.getMSLabelByScanNumber(scanNumber))
        

    def getFilters(self):
        """
        This function returns a list of filters       
        """
        ls_filter=self.source.GetFilters()
        ls_filter=[IScanFilter(item).ToString() for item in ls_filter]
        return(ls_filter)
    
    
    def getMS2ScanNumber(self,ls_mz,ls_RT,ls_charge=[],ppm=5e-6):
        """This function returns a list of potential tandem mass spectra for a list
           of mz- and RT-values.
           Input variable:
               name        type                description
               ls_mz       list                list of mz-values
               ls_RT       list                list of retention time values
               ls_charge   list(optional)      list of charge values
               ppm         float               Error in ppm        
        """
        df_MS2=self.getPrecursorInformation()
        ls_scanNumber=list()
        for n,mz in enumerate(ls_mz):
            RT=ls_RT[n]
            temp_df=df_MS2[(df_MS2['StartTime']>RT-3)&(df_MS2['StartTime']<RT+3)]
            if ls_charge:
                charge=ls_charge[n]
                result_df=temp_df[df_MS2['precursorCharge']==charge]
            else:
                result_df=temp_df
            result_df=result_df[(result_df['PrecursorMass']>(mz-mz*ppm))&(result_df['PrecursorMass']<(mz+mz*ppm))]
            if len(result_df)==0:
                result_df=temp_df[(result_df['observed_mz']>(mz-mz*ppm))&(temp_df['observed_mz']<(mz+mz*ppm))]
            if len(result_df)==0:
                ls_scanNumber.append(-1)
            elif len(result_df)==1:
                ls_scanNumber.append(int(result_df['scanNumber'].iloc[0]))
            else:
                result_df=result_df[result_df['precursorIntens']==max(result_df['precursorIntens'])]
                ls_scanNumber.append(int(result_df['scanNumber'].iloc[0]))
        return(ls_scanNumber)    

    def getDetailedPrecursorInformation(self):
        """
        This function returns a pandas dataframe containing information about all tandem mass
        spectra in one run. The dataframe includes following columns:
            scanNumber
            PrecursorMass
            StartTime
            TIC
            precursorIntensity
            precursorCharge
            observedMZ               
        """
        rows=list()
        for scanNumber in range(1,self.numOfSpectra+1):
            info=self.source.GetFilterForScanNumber(scanNumber)
            massOrder=info.MSOrder
            if massOrder==1:
                buff=self.getMSLabelByScanNumber(scanNumber)
                parent_mzValues=np.array(buff['mz'])
                parent_intensValues=np.array(buff['intensity'])
                parent_charge_values=np.array(buff['charge'])
            if massOrder>1:
                scanEvent=self.source.GetScanEventForScanNumber(scanNumber)
                reaction=scanEvent.Reactions[0]
                precursor_mz=reaction.PrecursorMass
                StartTime=self.source.RetentionTimeFromScanNumber(scanNumber)
                scan_stats = self.source.GetScanStatsForScanNumber(1468)
                lower_index=0
                upper_index=0
                n=1
                while lower_index==upper_index:              
                    lower_index=bisect.bisect_left(parent_mzValues,precursor_mz-precursor_mz*5e-6*n)
                    upper_index=bisect.bisect_right(parent_mzValues,precursor_mz+precursor_mz*5e-6*n)
                    n+=1
                if upper_index-lower_index>1:
                    buff_mz=np.array(parent_mzValues[lower_index:upper_index])
                    buff_mz_error=abs(buff_mz-precursor_mz)
                    buff_mz=buff_mz[buff_mz_error.argmin()]
                    intens=parent_intensValues[parent_mzValues==buff_mz][0]
                    charge=parent_charge_values[parent_mzValues==buff_mz][0]
                else: 
                    buff_mz=parent_mzValues[lower_index:upper_index][0]
                    intens=parent_intensValues[lower_index:upper_index][0]
                    charge=parent_charge_values[lower_index:upper_index][0]
                rows.append([scanNumber,precursor_mz,StartTime,scan_stats.TIC,intens,charge,buff_mz])
        df=pd.DataFrame(rows,columns=['scanNumber','PrecursorMass','StartTime','TIC','precursorIntens','precursorCharge','observed_mz'])
        df.name="PrecursorList@"+self.baseName
        return df
    
    def getAverageSpectrumByScanNumber(self,firstScanNumber,lastScanNumber):
        options = Extensions.DefaultMassOptions(self.source)
        options.ToleranceUnits = ToleranceUnits.ppm
        options.Tolerance = 5.0
        scanFilter = IScanFilter(self.source.GetFilterForScanNumber(firstScanNumber))
        averageScan = Extensions.AverageScansInScanRange(self.source, firstScanNumber, lastScanNumber, scanFilter, options)
                
        try:
            scan = averageScan.SegmentedScan
        except:
            df=pd.DataFrame(columns=['mz','intensity'])
            return(df)
        df=pd.DataFrame()
        df['mz']=list(scan.Positions)
        df['intensity']=list(scan.Intensities)
        return(df) 
    
    
    def getAverageSpectrumByRT(self,firstRT,lastRT):
        options = Extensions.DefaultMassOptions(self.source)
        options.ToleranceUnits = ToleranceUnits.ppm
        options.Tolerance = 5.0
        firstScanNumber=self.source.ScanNumberFromRetentionTime(firstRT)
        lastScanNumber=self.source.ScanNumberFromRetentionTime(lastRT)
        scanFilter = IScanFilter(self.source.GetFilterForScanNumber(firstScanNumber))
        averageScan = Extensions.AverageScansInScanRange(self.source, firstScanNumber, lastScanNumber, scanFilter, options)                
        try:
            scan = averageScan.SegmentedScan
        except:
            df=pd.DataFrame(columns=['mz','intensity'])
            return(df)
        df=pd.DataFrame()
        df['mz']=list(scan.Positions)
        df['intensity']=list(scan.Intensities)
        return(df)


if(__name__ == "__main__"):
    rowfile = ThermoRawReader("./D3.raw")
    tic = rowfile.getTIC()
    data = rowfile.getMetaData()
    print(data)

    print(tic.head())