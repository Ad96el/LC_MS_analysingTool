# -------------------------------------------------------------------------
#     Copyright (C) 2005-2013 Martin Strohalm <www.mmass.org>

#     This program is free software; you can redistribute it and/or modify
#     it under the terms of the GNU General Public License as published by
#     the Free Software Foundation; either version 3 of the License, or
#     (at your option) any later version.

#     This program is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#     GNU General Public License for more details.

#     Complete text of GNU GPL can be found in the file LICENSE.TXT in the
#     main directory of the program.
# -------------------------------------------------------------------------

# load stopper
from .mod_stopper import *

# load building blocks
from .blocks import *

# load objects
from .obj_compound import *
from .obj_sequence import *
from .obj_peak import *
from .obj_peaklist import *
from .obj_scan import *

# load modules
from .mod_basics import *
from .mod_pattern import *
from .mod_signal import *
from .mod_calibration import *
from .mod_peakpicking import *
from .mod_proteo import *
from .mod_formulator import *
from .mod_envfit import *
from .mod_mascot import *
from .mod_utils import *

# load parsers
from .parser_xy import parseXY
from .parser_mzxml import parseMZXML
from .parser_mzdata import parseMZDATA
from .parser_mzml import parseMZML
from .parser_mgf import parseMGF
from .parser_fasta import parseFASTA

import numpy as np 
 


def calcualte_window(signal, peaks, threshold=2):
    x_values = signal[:,0]
    y_values = signal[:,1]
    result = []
    for i in range(len(peaks)):
        distance = np.abs(x_values - peaks[i])
        index = np.argmin(distance) 
        leftSide = signal[:index]
        rightSide = signal[index:]
        window = []
        for point in np.flip(leftSide, 0 ):  
            if(point[1] < threshold):
                window.append(point[0])
                break
        for point in rightSide:
            if(point[1] < threshold):
                window.append(point[0])
                break 
        if(len(window) == 1):
            window.append(rightSide[len(rightSide) -1 ][0])
        if(len(window) == 0):
            window.append(leftSide[len(leftSide) -1 ][0])
            window.append(rightSide[len(rightSide) -1 ][0])
        result.append(window) 
    return result

def detect_peak(signal ,pickingHeight=0.75, absThreshold=0, relThreshold=0, snThreshold=0, baselineWindow=0.1, baselineOffset=0, smoothMethod=None, smoothWindow=0.2, smoothCycles=1):
    # check pandas props. 
    profile = np.dstack((signal.x,signal.y))[0]
    first = scan(profile=profile)
    first.labelscan(pickingHeight=pickingHeight, absThreshold=absThreshold, relThreshold= relThreshold, snThreshold= snThreshold , baselineWindow=baselineWindow, baselineOffset= baselineOffset, smoothMethod= smoothMethod, smoothWindow=smoothWindow, smoothCycles=smoothCycles)
    peaks = [z.mz for z in first.peaklist] 
    windows = calcualte_window(profile, peaks, absThreshold)
    return [z.mz for z in first.peaklist], windows


 







