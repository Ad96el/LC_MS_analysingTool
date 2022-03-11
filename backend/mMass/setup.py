from distutils.core import setup, Extension
import numpy as np 
calculations_module = Extension("calculations", sources=["calculations.c"])

setup(
    name="calculations",
    version="1.0.1",
    description="Calculations",
    ext_modules=[calculations_module],
    include_dirs=[np.get_include()],
)
