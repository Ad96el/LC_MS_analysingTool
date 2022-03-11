# syntax=docker/dockerfile:1

FROM python:3.9

# proxy env

# ENV http_proxy=http://chvproxy.lonzagroup.net:8080
# ENV https_proxy=http://chvproxy.lonzagroup.net:8080
# ENV HTTP_PROXY=http://chvproxy.lonzagroup.net:8080
# ENV HTTPS_PROXY=http://chvproxy.lonzagroup.net:8080

# mono
RUN apt-get update && apt-get install -y git wget apt-transport-https 
RUN wget https://packages.microsoft.com/config/debian/10/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb

RUN apt-get update && apt-get install -y dotnet-sdk-5.0 aspnetcore-runtime-5.0 dotnet-runtime-5.0 curl  


RUN git clone https://github.com/pythonnet/pythonnet
WORKDIR /pythonnet 
 
RUN python setup.py build_dotnet
RUN python setup.py bdist_wheel

RUN apt-get install -y apt-transport-https dirmngr gnupg ca-certificates
RUN curl -sSL 'http://keyserver.ubuntu.com/pks/lookup?op=get&search=0x3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF' |  apt-key add -
RUN echo "deb https://download.mono-project.com/repo/debian stable-stretch main" |  tee /etc/apt/sources.list.d/mono-official-stable.list
RUN apt-get update && apt install -y mono-devel nuget



# install pythonnet
WORKDIR /pythonnet 
RUN python setup.py install


WORKDIR /
COPY . . 

# install app dependencies 
WORKDIR /intact_server
RUN pip install -r requirements.txt 

# install rawReader 
WORKDIR /rawReader
RUN cp -r rawReader /usr/local/lib/python3.9/site-packages/ 

#install UniDec 
RUN apt-get update && apt-get install -y libfftw3-dev hdf5-tools libhdf5-dev libgdk-pixbuf2.0-dev
WORKDIR /UniDec/unidec_src/cfunction/
RUN ./compilelinux.sh
WORKDIR /
RUN cp -r UniDec /usr/local/lib/python3.9/site-packages/ 

# install mMass  
WORKDIR /mMass 
RUN cp -r mspy /usr/local/lib/python3.9/site-packages/ 
RUN python setup.py install
 
# for production and UniDec
RUN pip install waitress h5py

WORKDIR /intact_server