# AD Ibex Frontend

This repository provides the frontend for the AD ibex system. The frontend is written in React, a JavaScript based framework, for UI implementation. 
Please have a look on the other repositories to understand the system in total. 

## Motivation

A biopharmaceutical is a biological medical product extracted from a biological source. The most significant fraction of available biopharmaceuticals are monoclonal antibodies (mAbs)
 prescribed for different kinds of cancers or autoimmune diseases. Currently, next to the mRNA vaccinations against Covid-19, mAbs are being developed to treat infected persons with 
 severe disease progression. These proteins can have different glycosylations and modifications. Compared to chemical-based pharmaceutics, proteins have a high molecular weight. 
 Hence the likelihood of causing unwanted modification during the development and manufacturing is higher. These modifications can lead to reduced potency or, 
 in the worst case causing side effects. Because of the higher complexity, advanced physio-chemical analytical methods are required to analyze these proteins to identify impurities, 
 possibly caused by the modifications. Mass spectrometry (MS) plays a significant role in different applications like intact mass analysis and peptide mapping. MS is an analytical 
 technique that is used to measure the mass-to-charge ratio of ions. The results are typically presented as a mass spectrum, a plot of intensity as a function of the mass-to-charge ratio. 
 MS is used to identify the different modifications of the proteins because these modifications are changing the unmodified protein mass. Intact mass analysis regenerates
two sets of data. One originates from the liquid chromatography (LC) hyphenated to the mass spectrometer (MS) instrument. The second set is a set of MS spectra generated 
continuously while the LC is running. The signal processing of the chromatogram generated by the LC is fundamental. It only requires a low number of peak picking to identify 
their start and end to sum the corresponding mass spectra up. The MS spectrum itself requires advanced signal processing algorithms because next to the peak picking, a 
deconvolution algorithm needs to be applied to compute the intact mass out of signal peaks, each representing a charge state of the protein. Next to
commercially available software for deconvolution like WatersMassLynx, Thermos BiopharmaFinder, and ProeteinMectrics, open-source solutions like UniDec and FLASHDeconv are 
also available. Software to analyze analytical data requires data integrity, ideally from data acquisition until result reporting. The named solutions above only are offering
one processing step. The results from one tool are forwarded to the next tool for further processing. 
Solutions that provide data integrity are only offered by some vendors only applicable to data files acquired on their instruments. 
Furthermore, these solutions are monolithic and only suitable for predefined purposes.

## Outline of Contribution
In this work, we aim to provide a vendor-independent and extendable solution by maintaining data integrity. Having an extendible system closes a gap pharmaceutical 
company???s face developing new formats of protein therapeutics. Especially biopharmaceutical development needs this agility considering how ordinary mABs are increasingly 
replaced by more complex constructs like bispecifics, single-chain Fvs, and peptide fusions. Lastly, we aim to optimize the open-source solutions to compute the intact mass of 
existing biotherapeutics generating no artifacts.

##Architecture

Microservices is an architectural style that structures an application as a collection of services that are
- Highly maintainable and testable
- Loosely coupled with REST api or consumer/producer
- Independently deployable
- Owned by a small team The intact mass server is a microservice. The corresponding user interface can be found in the repo: xyz.

This repo is structred as followed:

The src folder contains all the necessary informations. 
This repositry is using [React Admin](https://marmelab.com/react-admin/), [Material-UI](https://material-ui.com/) and [Redux](https://redux.js.org/). 
Expacially React Admin is very important and powerful libarary. **Make yourself familiar with all three frameworks before starting to work on this repositry**. 

All three frameworks already offer a very detailed documentation. 

## Technologies 

The files are written in TypeScript. TypeScript is like JavaScript but it is type safe. 


## Adding custom page 

For adding a custom page have a look on src/routes.tsx 

"""JavaScript
import * as React from 'react';
import { Route } from 'react-router-dom';
import Configuration from './routes/Configuration';
import { MassCalculation } from './routes/massCalculation';

export default [
  <Route exact path="/configuration" render={() => <Configuration />} />,
  <Route exact path="/masscalculation/" render={() => <MassCalculation />} />,
];
"""


the path prop is defining on which url the site should be reachable. The render prop is defining what view should be rendered, when entering the site. The views 
should be mainted in the src/routes file. 

After adding the route to the system, a menu button has to be added as well. 

For adding a custom menu button go to: src/layout/Menu.tsx and add a MenuItemLink. The to prop should be the same as the path prop from the routes.tsx file.

"""JavaScript
      <MenuItemLink
        to="/masscalculation"
        primaryText={translate('resources.routes.masscalculation.name', {
          smart_count: 2,
        })}
        leftIcon={<FunctionsIcon />}
        onClick={onMenuClick}
        sidebarIsOpen={open}
        dense={dense}
      />
"""

The ListView, ShowView and EditView are React Admin specific views. They are mainly usefull, if you store data in your backend and you want to show, list or edit them. 
For more information go to the offical documentation [React Admin](https://marmelab.com/react-admin/).    

## reducer 

Redux offers a global state. In React a state is only reachable in a component. Redux offers the possibility to send messages globaly. 
Actions are defining which state should be changed. The reducer is offering the initial state. 
For more information go to the offical documentation [Redux](https://redux.js.org/). 


## installation and deployment

To install the dependencies just run npm install. 





