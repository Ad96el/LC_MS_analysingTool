from setuptools import setup
import setuptools
import os



def copy_dir():
    current = os.path.dirname(os.path.realpath(__file__))
    dir_path = './rawReader/dlls'
    base_dir = os.path.join(current, dir_path)
    for (dirpath, dirnames, files) in os.walk(base_dir):
        for f in files:
            yield os.path.join(dirpath.split('/', 1)[1], f)

setup(
    name="rawReader",
    version="0.0.1",
    author="Vahid Golghalyani",
    author_email="vahid.golghalyani@lonza.com",
    description="Read raw",    
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ], 
    packages=['rawReader'], 
    python_requires=">=3.6",
    package_data = {
    '' : [f for f in copy_dir()]
},
)

