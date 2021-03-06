import { TranslationMessages } from 'react-admin';
import englishMessages from 'ra-language-english';

const customEnglishMessages: TranslationMessages = {
  ...englishMessages,
  util: {
    save: 'Save changes',
    create: 'Save and Create',
    cancel: 'Cancel',
    apply: 'Apply',
    clear: 'Clear',
  },
  pos: {
    search: 'Search',
    configuration: 'Configuration',
    language: 'Language',
    theme: {
      name: 'Theme',
      light: 'Light',
      dark: 'Dark',
    },
    dashboard: {
      welcome: {
        title: 'Welcome to the AD Ibex Dashboard',
        subtitle: 'This Dashboard provides some useful tools for data mining or data persistence.',
        home: 'Homepage',
        other: 'Other Apps',
      },
    },
  },
  error: {
    ambr: 'Error in Creating Ambr file',
  },
  resources: {
    message: {
      createambr: 'Creating Ambr file. Please wait...',
      loading: 'Loading',
      methodedit: 'The Method is getting updated. Please wait...',
      methodcreate: 'The Method is getting created. Please wait...',
      samplecreate: 'Samples are getting created. Please wait...',
      sampleEdit: 'Result is going to be created. Please wait...',
      samplesetEdit: 'Sample Set is getting updated. Please wait...',
      sampleset: 'Result Set with all Results are getting created. This operation is computation heavy. Please wait...',
      combine: 'Results get combined. Please wait...',
      table: 'Tables are getting prepared. Please wait...',
    },
    util: {
      button: {
        submit: 'Submit',
        version: 'Versions',
      },
    },
    routes: {
      ambr: {
        export: 'Export Summary',
        datakeys: 'Data Keys',
        clear: 'Clear Data',
        name: 'Ambr File',
        calculate: 'Calculate',
        error: {
          filecount: 'There must be two files uploaded. ',
          format: 'The two uploaded files has to be An Excel file and a 7z file.',
        },
      },
      masscalculator: 'Mass Calculator',
      intactmass: 'Intact Mass',
      users: {
        name: 'Users',
        email: 'Username',
        created: 'Created',
        role: 'Role',
      },
      masscalculation: {
        calculator: 'Calculator',
        add: 'Add Modification',
        name: 'Protein Masses',
        upload: 'Upload',
        glyco: 'Enable Glycolysation',
        clear: 'Clear',
        quant: 'Number of Chains',
        errorFile: 'Wrong File Attached!',
        mod: 'Modification',
        modQ: 'Quantity',
        var: 'Variable number of Modification',
        calculate: 'Calculate',
        reset: 'Reset',
        remove: 'Remove Modification',
        export: 'Export',
      },
      peakpicking: {
        animation: 'Disable Animation',
        name: 'Peak Picking',
        zoom: 'Zoom',
        zoomo: 'Zoom out',
        select: 'Select Peak',
        createResultSet: 'Create Result Set',
        spectrom: 'Select Spectrom',
        zoomtip: 'Use Right Click',
        selecttip: 'Use Left Click',
        zoomotip: 'Press on Mouse Wheel',
        spectromtip: 'Press Ctrl',
        time: 'Time in Minute',
        weight: 'Weight in MZ/T',
        png: 'Export',
        pngtip: 'Export the plot as an png',

      },
      sample: {
        user: 'Created By',
        sample: 'Name',
        name: 'Sample',
        type: 'Sample Type',
        created: 'Data Aquired at',
        sampleset: 'Corresponding Sample Set',
        methodset: 'Processed with Method Set',
        color: 'Sample Color',
        switch: 'Switch between other Samples',
        file: 'Files to Upload',
        drop: 'Drop the Files here',
        result: 'Corresponding Result',
        peakprops: 'Peak Selected Properties',
        ms: 'Mass Spectrometry',
        detectpeak: 'Detected Peaks',
        methodprops: 'Method Properties',
        lc: 'Liquid Chromatography',
        fitdat: 'Show fitted Data',
        peakswitch: 'Switch between other peaks',
        meta: 'Meta Informations',
        peakselect: 'Peak Selection',
        decon: 'Deconvolution',
        msspectrum: 'Mass Spectrum',
        tabledeconpeak: 'Deconvoluted Peaks',
        expmass: 'Expected provided masses',
        confirmsaveExp: 'If you want to save the meta information of the sample, press the second button. If you want to save the meta information and create/update a result, please press the last button.',
        confirmSave: 'Confirm Save',
        tableassign: 'Fasta Score to Deconvolution',
        reduceData: 'Reduced data for Visualization',
      },
      method: {
        fasta: 'Sequence',
        peakwindow: 'Peak Window size',
        peakthresh: 'Peak Threshold',
        zzsig: 'placeholder',
        peakplotthresh: 'Peak Threshold Plot',
        reduction: 'Data Reduction Threshold Decon',
        zzsigs: 'ZZsig',
        reductionRaw: 'Data Reduction MS',
        beta: 'Beta Value',
        psig: 'PS Threshold',
        peak: 'Peak Selection',
        decon: 'Deconvolution',
        meta: 'Meta Information',
        action: 'Actions',
        name: 'Methods',
        system_name: 'Name of System',
        method: 'Method Name',
        type: 'Type',
        created: 'Created',
        version: 'Version',
        user: 'Created by',
        update: 'Apply Changes',
        peaktab: 'Peak Selection',
        decontab: 'Deconvoltuion',
        peakprops: 'Peak Properties',
        comp: 'Expected Components',
        calcprops: 'Calculation Properties',
        pickingHeight: 'Picking Height',
        absThreshold: 'Absolute Threshhold',
        relThreshold: 'Relative Threshold',
        baselineWindow: 'Baseline Window',
        baselineOffset: 'Baseline Offset',
        smoothMethod: 'Smooth Method',
        smoothWindow: 'Smooth Window',
        smoothCycles: 'Smooth Cylces',
        snThreshold: 'Signal To Noise Threshold',
        componentname: 'Selected Component name',
        RT: 'RT',
        window: 'Window Size',
        typePeak: 'Peak Type',
        intthresh: 'Intthresh',
        mzbins: 'mzbin',
        smooth: 'Smooth Mehod',
        subtype: 'subtype',
        subbuff: 'subbuff',
        maxmz: 'MZ End',
        minmz: 'MZ Start',
        massbins: 'Mass bins',
        reductionpercent: 'reductionpercent',
        kind: 'kind',
        masslb: 'Mass Range Start',
        massub: 'Mass Range End',
        mzsig: 'Peak FWHM',
        startz: 'Charge Start',
        endz: 'Charge End',
        numit: 'Iterations',
        masspreview: 'Preview of the masses',
        mass: 'Masses',
        massscore: 'Assignments',

      },
      modification: {
        name: 'Name',
        created: 'Created',
        formula_add: 'Chemical Forumla to Add',
        formula_sub: 'Chemical Formula to Sub',
        kind: 'Kind of Modification',
        mass: 'Mass',
        modification: 'Modification',
      },
      modificationset: {
        name: 'Name',
        created: 'Created',
        modificationsinclud: 'Modifications Included to the System',
        modificationset: 'Modification Set',
        selectedGlyco: 'Selected Glycolysation',
        avalGlyco: 'Available Glycolysation',
        selectedMod: 'Selected Modification',
        avalMod: 'Available Modification',

      },
      methodset: {
        name: 'Method Sets',
        methodset: 'Name of Methodset',
        method: 'Possible Methods',
        created: 'Created',
        user: 'Created by',
        version: 'Version',
        methodincluded: 'Method of Methodset',
        possibleMethod: 'Possible Methods',
      },
      sampleset: {
        name: 'Sample Sets',
        descr: 'Description',
        system_name: 'System Name',
        created: 'Created',
        version: 'Version',
        project: 'Corresponding Project',
        user: 'Created By',
        sample: 'Corresponding Samples',
        resultset: 'Corresponding Result Set',
        meta: 'Meta information',
        add: 'Add More Samples',
        createresultset: 'Create Result set with all Samples from the Sample Set',
      },
      result: {
        created: 'Created',
        user: 'Created By',
        sample: 'Corresponding Sample',
        methodset: 'Generated by Method Set',
        name: 'Results',
        version: 'Version',
        resultset: 'Corresponding Result Set',
        meta: 'Meta Information',

      },
      project: {
        name: 'Projects',
        project: 'Name of the Project',
        sop: 'Corresponding SOP',
        desc: 'Description of the Project',
        created: 'Created',
        user: 'Created by',
      },
      resultset: {
        validation: 'Validation',
        expect: 'It is expected: 2*H + 2*L = D',
        diffHeavy: 'Error in Heavy Chain (H)',
        diffLight: 'Error in Light Chain (L)',
        diffD: 'Error in Deglycosylation (D)',
        errors: 'Errors',
        speciesHeavy: 'Heavy Chain species',
        speciesLight: 'Light Chain species',
        sugar: 'Sugar Candidates',
        combine: 'Combine the four different analysis',
        merge: 'merge',
        name: 'Result Sets',
        created: 'Created',
        user: 'Created By',
        version: 'Version',
        sampleset: 'Corresponding Sample Set',
        submit: 'Submit',
        possibleResults: 'Possible Results',
      },
      dashboard: {
        users: 'Users',
        project: 'Projects',
        sample: 'Samples',
        sampleno: 'Sampe Without Method Set',
        sampleset: 'Sample Sets',
        projectnew: 'Newest Project',
        welcome: 'hello ',
      },
    },
  },

};

export default customEnglishMessages;
