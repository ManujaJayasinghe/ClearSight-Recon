import { writeFileSync } from 'node:fs'
import { FORM_OPTIONS } from '../src/constants/witnessForm.js'
import { FORM_SECTIONS } from '../src/constants/witnessFormSections.js'
import { FIELD_LABELS } from '../src/constants/witnessForm.js'

const enOptions = {}
for (const [field, values] of Object.entries(FORM_OPTIONS)) {
  enOptions[field] = {}
  for (const v of values) enOptions[field][v] = v
}

const siOptions = {
  gender: { Male: 'පුරුෂ', Female: 'ස්ත්‍රී' },
  ethnicity: {
    'South Asian': 'දකුණු ආසියානු',
    'East Asian': 'නැගෙනහිර ආසියානු',
    'Southeast Asian': 'ගිනිකොණ ආසියානු',
    'Middle Eastern': 'මැද පෙරදිග',
    'West African': 'බටහිර අප්‍රිකානු',
    'East African': 'නැගෙනහිර අප්‍රිකානු',
    European: 'යුරෝපීය',
    'Latin American': 'ලතින් අමෙරිකානු',
    Mixed: 'මිශ්‍ර',
  },
  faceShape: {
    Oval: 'ඕවල්',
    Round: 'වට',
    Square: 'සෑකෝණ',
    Heart: 'හද',
    Diamond: 'දියමන්ති',
    Oblong: 'දිග',
  },
  skinTone: {
    'Very light': 'ඉතා සැහැල්ලු',
    Light: 'සැහැල්ලු',
    Medium: 'මධ්‍යම',
    Olive: 'ඔලිව්',
    Brown: 'දුඹුරු',
    'Dark brown': 'අඳුරු දුඹුරු',
    Dark: 'අඳුරු',
  },
  ageRange: {
    Teenager: 'දරුවන්',
    '20s': 'වසර 20',
    '30s': 'වසර 30',
    '40s': 'වසර 40',
    '50s': 'වසර 50',
    '60s+': 'වසර 60+',
  },
  foreheadSize: { Small: 'කුඩා', Medium: 'මධ්‍යම', Large: 'විශාල' },
  foreheadShape: { Flat: 'පැතල', Rounded: 'වට', Prominent: 'ප්‍රකට' },
  eyeShape: {
    Almond: 'බදම්',
    Round: 'වට',
    Hooded: 'හුඩ්',
    Monolid: 'එකල්',
    Upturned: 'ඉහළ',
    Downturned: 'පහළ',
  },
  eyeColor: {
    Brown: 'දුඹුරු',
    Black: 'කළු',
    Blue: 'නීල',
    Green: 'කොළ',
    Hazel: 'හේසල්',
    Grey: 'අළු',
  },
  eyeSize: { Small: 'කුඩා', Medium: 'මධ්‍යම', Large: 'විශාල' },
  eyebrowThickness: { Thin: 'සිහින්', Medium: 'මධ්‍යම', Thick: 'ඝන' },
  eyebrowShape: {
    Straight: 'සෘජු',
    Arched: 'වක්‍ර',
    Flat: 'පැතල',
    Bushy: 'ඝන',
    Curved: 'වක්‍ර',
  },
  eyebrowColor: {
    Black: 'කළු',
    'Dark brown': 'අඳුරු දුඹුරු',
    Brown: 'දුඹුරු',
    'Light brown': 'සැහැල්ලු දුඹුරු',
    Blonde: 'රුවන්',
    Grey: 'අළු',
  },
  noseType: {
    Narrow: 'සිහින්',
    Broad: 'පළල',
    Hooked: 'කුරු',
    Upturned: 'ඉහළ',
    Flat: 'පැතල',
    Bulbous: 'බුල්බස්',
  },
  noseSize: { Small: 'කුඩා', Medium: 'මධ්‍යම', Large: 'විශාල' },
  nostrilWidth: { Narrow: 'සිහින්', Medium: 'මධ්‍යම', Wide: 'පළල' },
  noseBridgeHeight: { Low: 'අඩු', Medium: 'මධ්‍යම', High: 'ඉහළ' },
  lipThickness: { Thin: 'සිහින්', Medium: 'මධ්‍යම', Full: 'පූර්ණ' },
  mouthWidth: { Narrow: 'සිහින්', Medium: 'මධ්‍යම', Wide: 'පළල' },
  lipColor: {
    'Light pink': 'සැහැල්ලු රෝස',
    'Medium pink': 'මධ්‍යම රෝස',
    'Dark pink': 'අඳුරු රෝස',
    Brown: 'දුඹුරු',
    'Dark brown': 'අඳුරු දුඹුරු',
  },
  philtrumLength: { Short: 'කෙටි', Medium: 'මධ්‍යම', Long: 'දිග' },
  cheekboneProminence: {
    Flat: 'පැතල',
    Medium: 'මධ්‍යම',
    'High/Prominent': 'ඉහළ/ප්‍රකට',
  },
  jawShape: { Sharp: 'තියුණු', Rounded: 'වට', Square: 'සෑකෝණ', Soft: 'මෘදු' },
  jawWidth: { Narrow: 'සිහින්', Medium: 'මධ්‍යම', Wide: 'පළල' },
  faceSymmetry: {
    Symmetric: 'සමමිතික',
    'Slightly asymmetric': 'සුළු අසමමිතික',
  },
  earSize: { Small: 'කුඩා', Medium: 'මධ්‍යම', Large: 'විශාල' },
  earProtrusion: {
    'Flat against head': 'හිසට එරෙහි පැතල',
    'Slightly protruding': 'සුළු පිටතට',
    Protruding: 'පිටතට',
  },
  hairColor: {
    Black: 'කළු',
    'Dark brown': 'අඳුරු දුඹුරු',
    Brown: 'දුඹුරු',
    'Light brown': 'සැහැල්ලු දුඹුරු',
    Blonde: 'රුවන්',
    Red: 'රතු',
    Grey: 'අළු',
    White: 'සුදු',
    Bald: 'නිල්වන්',
  },
  hairLength: {
    Bald: 'නිල්වන්',
    'Very short': 'ඉතා කෙටි',
    Short: 'කෙටි',
    Medium: 'මධ්‍යම',
    Long: 'දිග',
  },
  hairStyle: {
    Straight: 'සෘජු',
    Wavy: 'තරංග',
    Curly: 'කරල්',
    Afro: 'ඇෆ්‍රෝ',
    'Pulled back': 'පිටුපසට',
    Dreadlocks: 'ඩ්‍රෙඩ්ලොක්ස්',
  },
  facialHair: {
    None: 'නැත',
    'Light stubble': 'සැහැල්ලු රැවිලි',
    'Heavy stubble': 'ඝන රැවිලි',
    'Thin mustache': 'සිහින් මීසය',
    'Thick mustache': 'ඝන මීසය',
    Goatee: 'ගෝටී',
    'Short beard': 'කෙටි රැවිල්',
    'Long beard': 'දිග රැවිල්',
    'Full beard': 'පූර්ණ රැවිල්',
  },
  scarLocation: {
    None: 'නැත',
    'Left cheek': 'වම් කම්මුල',
    'Right cheek': 'දකුණු කම්මුල',
    Forehead: 'හිසපිට',
    Chin: 'තොල්',
    'Upper lip': 'ඉහළ තොල',
    'Lower lip': 'පහළ තොල',
    'Under left eye': 'වම් ඇස යට',
    'Under right eye': 'දකුණු ඇස යට',
    'Left temple': 'වම් කපොල',
    'Right temple': 'දකුණු කපොල',
    'Left jaw': 'වම් තොල්පෙට්ටිය',
    'Right jaw': 'දකුණු තොල්පෙට්ටිය',
    'Left side of nose': 'වම් නාසය පැත්ත',
    'Right side of nose': 'දකුණු නාසය පැත්ත',
    Neck: 'බෙහෙත්',
    'Bridge of nose': 'නාසයේ පාලම',
  },
  birthmarkLocation: {
    None: 'නැත',
    'Above left lip': 'වම් තොලට ඉහළ',
    'Above right lip': 'දකුණු තොලට ඉහළ',
    'Left cheek': 'වම් කම්මුල',
    'Right cheek': 'දකුණු කම්මුල',
    'Under left eye': 'වම් ඇස යට',
    'Under right eye': 'දකුණු ඇස යට',
    Forehead: 'හිසපිට',
    Chin: 'තොල්',
    Nose: 'නාසය',
    'Left temple': 'වම් කපොල',
    'Right temple': 'දකුණු කපොල',
    'Left jaw': 'වම් තොල්පෙට්ටිය',
    'Right jaw': 'දකුණු තොල්පෙට්ටිය',
  },
  glasses: {
    None: 'නැත',
    'Thin frame': 'සිහින් රාමු',
    'Thick frame': 'ඝන රාමු',
    Sunglasses: 'සූර්ය කණ්ණාඩි',
  },
  height: {
    Short: 'කෙටි',
    Average: 'සාමාන්‍ය',
    Tall: 'උස',
    'Very tall': 'ඉතා උස',
  },
  build: {
    Slim: 'සිහින්',
    Average: 'සාමාන්‍ය',
    Athletic: 'ක්‍රීඩා',
    Heavy: 'ඝන',
  },
  neckLength: { Short: 'කෙටි', Medium: 'මධ්‍යම', Long: 'දිග' },
  neckWidth: { Thin: 'සිහින්', Medium: 'මධ්‍යම', Thick: 'ඝන' },
}

for (const [field, values] of Object.entries(FORM_OPTIONS)) {
  if (!siOptions[field]) siOptions[field] = {}
  for (const v of values) {
    if (!siOptions[field][v]) siOptions[field][v] = v
  }
}

const formFieldsEn = {}
const formFieldsSi = {}
for (const [key, label] of Object.entries(FIELD_LABELS)) {
  const en =
    label.charAt(0).toUpperCase() + label.slice(1)
  formFieldsEn[key] = en
  formFieldsSi[key] = en // filled below from map
}

const fieldSi = {
  gender: 'ස්ත්‍රී/පුරුෂ භාවය',
  ethnicity: 'ජාතිකත්වය / කලාපීය මුලාශ්‍රය',
  faceShape: 'මුහුණේ හැඩය',
  skinTone: 'සමේ වර්ණය',
  ageRange: 'වයස් පරාසය',
  foreheadSize: 'හිසපිටේ ප්‍රමාණය',
  foreheadShape: 'හිසපිටේ හැඩය',
  eyeShape: 'ඇස් හැඩය',
  eyeColor: 'ඇස් වර්ණය',
  eyeSize: 'ඇස් ප්‍රමාණය',
  eyebrowThickness: 'ඇහිරි පෘෂ්ඨතාව',
  eyebrowShape: 'ඇහිරි හැඩය',
  eyebrowColor: 'ඇහිරි වර්ණය',
  noseType: 'නාසයේ වර්ගය',
  noseSize: 'නාසයේ ප්‍රමාණය',
  nostrilWidth: 'නාස නාඩි පළල',
  noseBridgeHeight: 'නාස පාලමේ උස',
  lipThickness: 'තොල් ඝනකම',
  mouthWidth: 'කට පළල',
  lipColor: 'තොල් වර්ණය',
  philtrumLength: 'පිල්ට්‍රම් දිග',
  cheekboneProminence: 'කම්මුල් ඇට ප්‍රකට බව',
  jawShape: 'තොල්පෙට්ටි හැඩය',
  jawWidth: 'තොල්පෙට්ටි පළල',
  faceSymmetry: 'මුහුණේ සමමිතිය',
  earSize: 'කනේ ප්‍රමාණය',
  earProtrusion: 'කන පිටතට එන බව',
  hairColor: 'හිසකෙස් වර්ණය',
  hairLength: 'හිසකෙස් දිග',
  hairStyle: 'හිසකෙස් විලාසය',
  facialHair: 'මුහුණේ රැවිල්',
  scarLocation: 'සිහි තැන',
  scars: 'සිහි විස්තරය',
  tattoos: 'ටැටූ',
  birthmarkLocation: 'උපන් ලකුණ / මොල් තැන',
  birthmarks: 'උපන් ලකුණ / මොල් විස්තරය',
  glasses: 'කණ්ණාඩි',
  otherFeatures: 'වෙනත් සලකුණු',
  height: 'උස',
  build: 'ශරීර ගැටවුම',
  neckLength: 'බෙහෙත් දිග',
  neckWidth: 'බෙහෙත් පළල',
}
Object.assign(formFieldsSi, fieldSi)

const sectionsEn = {}
const sectionsSi = {}
for (const s of FORM_SECTIONS) {
  sectionsEn[s.id] = { title: s.title, shortTitle: s.shortTitle }
  const siTitles = {
    face: { title: 'මුහුණේ ව්‍යුහය', shortTitle: 'මුහුණ' },
    eyes: { title: 'ඇස්', shortTitle: 'ඇස්' },
    nose: { title: 'නාසය', shortTitle: 'නාසය' },
    mouth: { title: 'කට සහ තොල්', shortTitle: 'කට' },
    jawline: { title: 'තොල්පෙට්ටිය සහ කම්මුල්', shortTitle: 'තොල්පෙට්ටිය' },
    ears: { title: 'කන', shortTitle: 'කන' },
    hair: { title: 'හිසකෙස්', shortTitle: 'හිසකෙස්' },
    'facial-hair': { title: 'මුහුණේ රැවිල්', shortTitle: 'රැවිල්' },
    distinguishing: { title: 'විශේෂ ලක්ෂණ', shortTitle: 'ලක්ෂණ' },
    build: { title: 'ශරීර ගැටවුම', shortTitle: 'ගැටවුම' },
    neck: { title: 'බෙහෙත් සහ සමස්ථ', shortTitle: 'බෙහෙත්' },
  }
  sectionsSi[s.id] = siTitles[s.id] ?? { title: s.title, shortTitle: s.shortTitle }
}

const ui = {
  site: {
    name: 'ClearSight-Recon',
    tagline: 'Forensic Composite Unit',
  },
  nav: {
    home: 'Home',
    witnessForm: 'Witness Description',
    sketchResult: 'Sketch Result',
    refinement: 'Refinement',
    pdfExport: 'PDF Export',
    mainAria: 'Main navigation',
  },
  home: {
    eyebrow: 'Forensic Composite System',
    description:
      'Transform witness descriptions into accurate forensic sketches. This secure workflow guides investigators from initial testimony through refinement and official PDF export.',
    heroTitle: 'Begin a New Composite Session',
    heroText:
      'Start by capturing the witness description. The system will generate an initial sketch, allow iterative refinement, and produce a court-ready PDF for case files.',
    startForm: 'Start Witness Form',
    featureIntakeTitle: 'Witness Intake',
    featureIntakeText:
      'Structured form for facial features, build, and distinguishing marks.',
    featureAiTitle: 'AI Sketch Generation',
    featureAiText: 'Convert descriptions into preliminary composite sketches.',
    featureExportTitle: 'Official Export',
    featureExportText: 'Generate stamped PDF reports for investigative records.',
  },
  form: {
    eyebrow: 'Step 1 — Intake',
    title: 'Witness Description Form',
    description:
      'Complete all required sections (marked with *) before generating a sketch. Jawline, ears, build, and neck details are optional.',
    selectPlaceholder: 'Select…',
    selectLocation: 'Select location',
    clearConfirm:
      'Clear all witness description fields? This cannot be undone.',
    submitError: 'Please complete all required fields before generating.',
    validationRequired: '{{field}} is required',
    clearForm: 'Clear Form',
    generateSketch: 'Generate Composite Sketch',
    progressLabel: 'Form progress',
    progressCount: '{{completed}} of {{total}} sections complete',
    progressPercent: '{{percent}} percent',
    sectionNavAria: 'Jump to form section',
    required: 'Required',
    previous: 'Previous',
    nextSection: 'Next section',
    placeholders: {
      scars: 'e.g. long diagonal scar, small circular scar',
      tattoos: 'e.g. tribal tattoo on right forearm, or "None"',
      birthmarks: 'e.g. dark brown mole, small flat birthmark',
      otherFeatures: 'Any additional details, or "None"',
    },
    scarLocationLabel: 'Scar location (on face)',
    fields: formFieldsEn,
    sections: sectionsEn,
  },
  result: {
    eyebrow: 'Step 2 — Generation',
    title: 'Suspect Composite Report',
    missingDescription:
      'No witness description was provided. Complete the witness form to generate a composite sketch.',
    goToForm: 'Go to Witness Form',
    caseReference: 'Case Reference',
    generated: 'Generated',
    inProgress: 'In progress…',
    primaryComposite: 'Primary Composite — Subject No. 1',
    selectMatchAria: 'Select the closest match',
    variation: 'Variation {{n}}',
    variationsHint:
      'Select the variation that best matches the witness description.',
    frontView: 'Front View',
    sideProfile: 'Side Profile',
    generationFailed: 'Generation failed',
    sideProfileFailed: 'Side profile failed',
    tryAgain: 'Try Again',
    frontAlt: 'Front view suspect composite',
    sideAlt: 'Side profile suspect composite',
    sidePlaceholder:
      'Generate a 90° side-profile view from the same witness description.',
    generatingSide: 'Generating Side Profile…',
    generateSide: 'Generate Side Profile',
    regenerating: 'Regenerating…',
    regenerateSide: 'Regenerate Side Profile',
    captionLoading:
      'Rendering {{count}} front composite variations from witness testimony…',
    captionError:
      'Composite could not be rendered. Adjust the description or retry.',
    captionSideLoading:
      'Front view complete. Side profile generation in progress…',
    captionChoose: 'Choose the closest match above, then refine or export.',
    captionDefault:
      'AI-generated forensic composites based on witness testimony.',
    summaryHeading: 'Witness Description Summary',
    summarySub:
      'Consolidated intake fields submitted during composite session. Verify accuracy before refinement or export.',
    summaryEmpty:
      'No witness details were entered. Return to the form to add a description.',
    fieldsOf: '{{filled}} of {{total}} fields',
    generatingBadge: 'Generating composite…',
    footerNote:
      'This report is for investigative use only. Distribution limited to authorized personnel. Composite subject to witness verification.',
    reportActionsAria: 'Report actions',
    refineSketch: 'Refine This Sketch',
    exportPdf: 'Export PDF',
    startOver: 'Start Over',
    leaveConfirm:
      'Generation is in progress. Leave and return to the form?',
    officialStamp: 'Official Use Only',
    notSpecified: 'Not specified',
    statusBuildingPrompt: 'Building portrait prompt…',
    statusRequesting:
      'Generating {{count}} composite variations (may take 3–6 minutes)…',
    statusProcessing: 'Processing…',
    statusSideBuilding: 'Building side-profile prompt…',
    statusSideRequesting: 'Generating side profile…',
    toastVariations: '{{count}} composite variations generated',
    toastFrontFailed: 'Front composite generation failed',
    toastSideSuccess: 'Side profile generated successfully',
    toastSideFailed: 'Side profile generation failed',
    errorFront:
      'Unable to generate the composite sketch. Please try again.',
    errorSide: 'Unable to generate the side profile. Please try again.',
  },
  refine: {
    eyebrow: 'Step 3 — Refinement',
    title: 'Sketch Refinement',
    missingDescription:
      'Generate a composite on the result page before refining features.',
    goToResult: 'Go to Sketch Result',
    description:
      'Adjust features and regenerate the composite until it matches witness testimony. Select any recent version below to compare or restore.',
    previewAria: 'Current composite sketch',
    currentComposite: 'Current Composite',
    refinedAlt: 'Refined composite sketch',
    statusApplying: 'Applying adjustment and regenerating sketch…',
    statusViewing: 'Viewing: {{label}}',
    statusLoading: 'Loading sketch…',
    controlsAria: 'Quick adjustments',
    quickAdjustments: 'Quick Adjustments',
    controlsSub:
      'Each control updates the witness description and generates a new composite. Hold Alt and press a shortcut key for faster adjustments.',
    shortcutsAria: 'Keyboard shortcuts',
    shortcutsTitle: 'Keyboard shortcuts',
    exportPdf: 'This Looks Right — Export PDF',
    historyAria: 'Version history',
    historyTitle: 'Version History',
    historySub:
      'Last {{count}} generated versions — click a thumbnail to restore',
    slot: 'Slot {{n}}',
    restoreAria: 'Restore {{label}}',
    backToReport: 'Back to Report',
    original: 'Original',
    adjusted: 'Adjusted',
    restored: 'Restored: {{label}}',
    sketchUpdated: '{{label}} — sketch updated',
    regenFailed: 'Could not regenerate the sketch. Please try another adjustment.',
    regenFailedToast: 'Regeneration failed. Please try again.',
    statusBuilding: 'Building portrait prompt…',
    statusRegenerating: 'Regenerating composite…',
    statusProcessing: 'Processing…',
    groups: {
      Nose: 'Nose',
      Hair: 'Hair',
      'Facial hair': 'Facial hair',
      Eyes: 'Eyes',
      Age: 'Age',
      'Skin tone': 'Skin tone',
    },
    controls: {
      'nose-wider': 'Make nose wider',
      'nose-narrower': 'Make nose narrower',
      'hair-longer': 'Make hair longer',
      'hair-shorter': 'Make hair shorter',
      'beard-add': 'Add beard',
      'beard-remove': 'Remove beard',
      'eyes-larger': 'Eyes larger',
      'eyes-smaller': 'Eyes smaller',
      'age-older': 'Adjust age older',
      'age-younger': 'Adjust age younger',
      'skin-lighter': 'Change skin tone (lighter)',
      'skin-darker': 'Change skin tone (darker)',
    },
    shortcuts: {
      nose: 'Nose wider / narrower',
      hair: 'Hair longer / shorter',
      beard: 'Add / remove beard',
      eyes: 'Eyes larger / smaller',
      age: 'Age older / younger',
      skin: 'Skin lighter / darker',
    },
  },
  pdf: {
    eyebrow: 'Step 4 — Export',
    title: 'PDF Export',
    description:
      'Generate an official forensic composite report for case documentation and distribution to authorized personnel.',
    officialReport: 'Official Composite Report',
    frontView: 'Front View',
    sideProfile: 'Side Profile',
    frontAlt: 'Front view composite',
    sideAlt: 'Side profile composite',
    frontPlaceholder: 'Front composite',
    sideNotGenerated: 'Side profile not generated',
    caseId: 'Case ID:',
    date: 'Date:',
    investigator: 'Investigator:',
    witnessId: 'Witness ID:',
    ageRange: 'Age range:',
    authorizedUser: '[Authorized User]',
    officialStamp: 'OFFICIAL USE ONLY',
    noImagesError:
      'No composite images were provided. Complete generation on the result page first.',
    exportOptions: 'Export Options',
    leadInvestigator: 'Lead Investigator',
    investigatorPlaceholder: 'Name and badge number',
    reportNotes: 'Report Notes',
    notesPlaceholder: 'Optional notes to include in the PDF footer',
    backToRefine: 'Back to Refinement',
    downloadPdf: 'Download PDF Report',
    newSession: 'New Session',
  },
  loading: {
    default: 'Generating composite sketch…',
    hint: 'Building forensic composite from witness description',
  },
  common: {
    none: 'None',
  },
}

const uiSi = JSON.parse(JSON.stringify(ui))
uiSi.site.tagline = 'විමර්ශන සංයුක්ත ඒකකය'
uiSi.nav = {
  home: 'මුල් පිටුව',
  witnessForm: 'සාක්ෂි විස්තරය',
  sketchResult: 'චිත්‍ර ප්‍රතිඵලය',
  refinement: 'සංශෝධනය',
  pdfExport: 'PDF නිර්යාත',
  mainAria: 'ප්‍රධාන සංචාලනය',
}
uiSi.home = {
  eyebrow: 'විමර්ශන සංයුක්ත පද්ධතිය',
  description:
    'සාක්ෂි විස්තර නිවැරදි විමර්ශන චිත්‍ර බවට පරිවර්තනය කරයි. මෙම ආරක්ෂිත ක්‍රමවේදය පරිශීලකයින්ට සාක්ෂි සටහන් සිට සංශෝධනය සහ නිල PDF නිර්යාත දක්වා මඟ පෙන්වයි.',
  heroTitle: 'නව සංයුක්ත සැසියක් ආරම්භ කරන්න',
  heroText:
    'සාක්ෂි විස්තරය සටහන් කිරීමෙන් ආරම්භ කරන්න. පද්ධතිය මුල් චිත්‍රයක් ජනනය කර, සංශෝධනයට ඉඩ දී, නඩු ගොනු සඳහා නඩුවට සුදුසු PDF නිර්මාණය කරයි.',
  startForm: 'සාක්ෂි පෝරමය ආරම්භ කරන්න',
  featureIntakeTitle: 'සාක්ෂි ඇතුළත් කිරීම',
  featureIntakeText:
    'මුහුණේ ලක්ෂණ, ශරීර ගැටවුම සහ විශේෂ සලකුණු සඳහා ව්‍යුහගත පෝරමය.',
  featureAiTitle: 'AI චිත්‍ර ජනනය',
  featureAiText: 'විස්තර පූර්ව සංයුක්ත චිත්‍ර බවට පරිවර්තනය කරයි.',
  featureExportTitle: 'නිල නිර්යාත',
  featureExportText: 'විමර්ශන වාර්තා සඳහා මුද්‍රිත PDF වාර්තා ජනනය කරයි.',
}
uiSi.form = {
  ...uiSi.form,
  eyebrow: 'පියවර 1 — ඇතුළත් කිරීම',
  title: 'සාක්ෂි විස්තර පෝරමය',
  description:
    'චිත්‍රයක් ජනනය කිරීමට පෙර සියලු අවශ්‍ය අංශ (*) සම්පූර්ණ කරන්න. තොල්පෙට්ටිය, කන, ශරීර ගැටවුම සහ බෙහෙත් විස්තර විකල්පයි.',
  selectPlaceholder: 'තෝරන්න…',
  selectLocation: 'ස්ථානය තෝරන්න',
  clearConfirm: 'සියලු සාක්ෂි විස්තර මකන්නද? මෙය අහෝසි කළ නොහැක.',
  submitError: 'ජනනය කිරීමට පෙර සියලු අවශ්‍ය ක්ෂේත්‍ර සම්පූර්ණ කරන්න.',
  validationRequired: '{{field}} අවශ්‍යයි',
  clearForm: 'පෝරමය මකන්න',
  generateSketch: 'සංයුක්ත චිත්‍රය ජනනය කරන්න',
  progressLabel: 'පෝරම ප්‍රගතිය',
  progressCount: 'අංශ {{total}} න් {{completed}} සම්පූර්ණ',
  progressPercent: 'ශතය {{percent}}',
  sectionNavAria: 'පෝරම අංශයට යන්න',
  required: 'අවශ්‍ය',
  previous: 'පෙර',
  nextSection: 'ඊළඟ අංශය',
  placeholders: {
    scars: 'උදා: දිගු රේඛා සිහිය, කුඩා වටකුරු සිහිය',
    tattoos: 'උදා: දකුණු අතේ ටැටූ, හෝ "නැත"',
    birthmarks: 'උදා: අඳුරු දුඹුරු මොල්, කුඩා පැතල උපන් ලකුණ',
    otherFeatures: 'අමතර විස්තර, හෝ "නැත"',
  },
  scarLocationLabel: 'සිහි තැන (මුහුණේ)',
  fields: formFieldsSi,
  sections: sectionsSi,
}
uiSi.result = {
  eyebrow: 'පියවර 2 — ජනනය',
  title: 'සැකකරු සංයුක්ත වාර්තාව',
  missingDescription:
    'සාක්ෂි විස්තරයක් ලබා නොදී ඇත. සංයුක්ත චිත්‍රය ජනනය කිරීමට සාක්ෂි පෝරමය සම්පූර්ණ කරන්න.',
  goToForm: 'සාක්ෂි පෝරමයට යන්න',
  caseReference: 'නඩු යොමුව',
  generated: 'ජනනය කළ දිනය',
  inProgress: 'ප්‍රගතියේ…',
  primaryComposite: 'ප්‍රධාන සංයුක්ත — විෂය 1',
  selectMatchAria: 'වඩාත් සමීප ගැලපීම තෝරන්න',
  variation: 'විභේදනය {{n}}',
  variationsHint: 'සාක්ෂි විස්තරයට වඩාත් ගැලපෙන විභේදනය තෝරන්න.',
  frontView: 'ඉදිරි දර්ශනය',
  sideProfile: 'පැති පැතිකඩ',
  generationFailed: 'ජනනය අසාර්ථකයි',
  sideProfileFailed: 'පැති පැතිකඩ අසාර්ථකයි',
  tryAgain: 'නැවත උත්සාහ කරන්න',
  frontAlt: 'ඉදිරි දර්ශන සැකකරු සංයුක්ත',
  sideAlt: 'පැති පැතිකඩ සැකකරු සංයුක්ත',
  sidePlaceholder:
    'එම සාක්ෂි විස්තරයෙන් 90° පැති පැතිකඩ දර්ශනය ජනනය කරන්න.',
  generatingSide: 'පැති පැතිකඩ ජනනය වෙමින්…',
  generateSide: 'පැති පැතිකඩ ජනනය කරන්න',
  regenerating: 'නැවත ජනනය වෙමින්…',
  regenerateSide: 'පැති පැතිකඩ නැවත ජනනය',
  captionLoading:
    'සාක්ෂි සාක්ෂියෙන් ඉදිරි සංයුක්ත විභේදන {{count}} රෙන්ඩර් වෙමින්…',
  captionError:
    'සංයුක්ත රෙන්ඩර් කළ නොහැක. විස්තරය සකස් කරන්න හෝ නැවත උත්සාහ කරන්න.',
  captionSideLoading:
    'ඉදිරි දර්ශනය සම්පූර්ණයි. පැති පැතිකඩ ජනනය ප්‍රගතියේ…',
  captionChoose:
    'ඉහළින් වඩාත් ගැලපෙන එක තෝරන්න, පසුව සංශෝධනය හෝ නිර්යාත කරන්න.',
  captionDefault:
    'සාක්ෂි සාක්ෂිය මත AI-ජනිත විමර්ශන සංයුක්ත.',
  summaryHeading: 'සාක්ෂි විස්තර සාරාංශය',
  summarySub:
    'සංයුක්ත සැසියේදී ඉදිරිපත් කළ එකතු කළ ඇතුළත් කිරීම් ක්ෂේත්‍ර. සංශෝධනය හෝ නිර්යාත කිරීමට පෙර නිරවද්‍යතාව සත්‍යාපනය කරන්න.',
  summaryEmpty:
    'සාක්ෂි විස්තර ඇතුළත් කර නැත. විස්තරය එක් කිරීමට පෝරමයට ආපසු යන්න.',
  fieldsOf: 'ක්ෂේත්‍ර {{total}} න් {{filled}}',
  generatingBadge: 'සංයුක්ත ජනනය වෙමින්…',
  footerNote:
    'මෙම වාර්තාව විමර්ශන භාවිතය සඳහා පමණි. බෙදාහැරීම අවසර ලැබූ පුද්ගලයින්ට සීමායි. සංයුක්ත සාක්ෂි සත්‍යාපනයට යටත්ය.',
  reportActionsAria: 'වාර්තා ක්‍රියා',
  refineSketch: 'මෙම චිත්‍රය සංශෝධනය කරන්න',
  exportPdf: 'PDF නිර්යාත',
  startOver: 'නැවත ආරම්භ කරන්න',
  leaveConfirm: 'ජනනය ප්‍රගතියේ. පෝරමයට යාමට පිටවන්නද?',
  officialStamp: 'නිල භාවිතය පමණි',
  notSpecified: 'නිර්දේශ නොකළ',
  statusBuildingPrompt: 'පෝට්‍රේට් ප්‍රොම්ප්ට් ගොඩනගමින්…',
  statusRequesting:
    'සංයුක්ත විභේදන {{count}} ජනනය (මිනිත්තු 3–6 ගත විය හැක)…',
  statusProcessing: 'සැකසෙමින්…',
  statusSideBuilding: 'පැති පැතිකඩ ප්‍රොම්ප්ට් ගොඩනගමින්…',
  statusSideRequesting: 'පැති පැතිකඩ ජනනය වෙමින්…',
  toastVariations: 'සංයුක්ත විභේදන {{count}} ජනනය විය',
  toastFrontFailed: 'ඉදිරි සංයුක්ත ජනනය අසාර්ථකයි',
  toastSideSuccess: 'පැති පැතිකඩ සාර්ථකව ජනනය විය',
  toastSideFailed: 'පැති පැතිකඩ ජනනය අසාර්ථකයි',
  errorFront: 'සංයුක්ත චිත්‍රය ජනනය කළ නොහැක. නැවත උත්සාහ කරන්න.',
  errorSide: 'පැති පැතිකඩ ජනනය කළ නොහැක. නැවත උත්සාහ කරන්න.',
}
uiSi.refine = {
  eyebrow: 'පියවර 3 — සංශෝධනය',
  title: 'චිත්‍ර සංශෝධනය',
  missingDescription:
    'ලක්ෂණ සංශෝධනය කිරීමට පෙර ප්‍රතිඵල පිටුවේ සංයුක්ත ජනනය කරන්න.',
  goToResult: 'චිත්‍ර ප්‍රතිඵලයට යන්න',
  description:
    'සාක්ෂි සාක්ෂියට ගැලපෙන තෙක් ලක්ෂණ සකස් කර සංයුක්ත නැවත ජනනය කරන්න. සංසරණයට හෝ ප්‍රතිස්ථාපනයට පහළින් මෑත අනුවාදයක් තෝරන්න.',
  previewAria: 'වර්තමාන සංයුක්ත චිත්‍රය',
  currentComposite: 'වර්තමාන සංයුක්ත',
  refinedAlt: 'සංශෝධිත සංයුක්ත චිත්‍රය',
  statusApplying: 'සංශෝධනය යොදා චිත්‍රය නැවත ජනනය වෙමින්…',
  statusViewing: 'බලනවා: {{label}}',
  statusLoading: 'චිත්‍රය පූරණය වෙමින්…',
  controlsAria: 'ඉක්මන් සංශෝධන',
  quickAdjustments: 'ඉක්මන් සංශෝධන',
  controlsSub:
    'සෑම පාලකයක්ම සාක්ෂි විස්තරය යාවත්කාලීන කර නව සංයුක්ත ජනනය කරයි. වේගවත් සංශෝධන සඳහා Alt ඔබා කෙටිමං යතුර ඔබන්න.',
  shortcutsAria: 'යතුරු පුවරු කෙටිමං',
  shortcutsTitle: 'යතුරු පුවරු කෙටිමං',
  exportPdf: 'මෙය නිවැරදියි — PDF නිර්යාත',
  historyAria: 'අනුවාද ඉතිහාසය',
  historyTitle: 'අනුවාද ඉතිහාසය',
  historySub:
    'අවසන් {{count}} ජනිත අනුවාද — ප්‍රතිස්ථාපනයට රුවය ක්ලික් කරන්න',
  slot: 'ස්ථානය {{n}}',
  restoreAria: '{{label}} ප්‍රතිස්ථාපනය',
  backToReport: 'වාර්තාවට ආපසු',
  original: 'මුල්',
  adjusted: 'සකස් කළ',
  restored: 'ප්‍රතිස්ථාපනය: {{label}}',
  sketchUpdated: '{{label}} — චිත්‍රය යාවත්කාලීන විය',
  regenFailed:
    'චිත්‍රය නැවත ජනනය කළ නොහැක. වෙනත් සංශෝධනයක් උත්සාහ කරන්න.',
  regenFailedToast: 'නැවත ජනනය අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
  statusBuilding: 'පෝට්‍රේට් ප්‍රොම්ප්ට් ගොඩනගමින්…',
  statusRegenerating: 'සංයුක්ත නැවත ජනනය වෙමින්…',
  statusProcessing: 'සැකසෙමින්…',
  groups: {
    Nose: 'නාසය',
    Hair: 'හිසකෙස්',
    'Facial hair': 'මුහුණේ රැවිල්',
    Eyes: 'ඇස්',
    Age: 'වයස',
    'Skin tone': 'සමේ වර්ණය',
  },
  controls: {
    'nose-wider': 'නාසය පළල් කරන්න',
    'nose-narrower': 'නාසය සිහින් කරන්න',
    'hair-longer': 'හිසකෙස් දිගු කරන්න',
    'hair-shorter': 'හිසකෙස් කෙටි කරන්න',
    'beard-add': 'රැවිල් එක් කරන්න',
    'beard-remove': 'රැවිල් ඉවත් කරන්න',
    'eyes-larger': 'ඇස් විශාල කරන්න',
    'eyes-smaller': 'ඇස් කුඩා කරන්න',
    'age-older': 'වයස වැඩි කරන්න',
    'age-younger': 'වයස අඩු කරන්න',
    'skin-lighter': 'සමේ වර්ණය (සැහැල්ලු)',
    'skin-darker': 'සමේ වර්ණය (අඳුරු)',
  },
  shortcuts: {
    nose: 'නාසය පළල් / සිහින්',
    hair: 'හිසකෙස් දිගු / කෙටි',
    beard: 'රැවිල් එක් / ඉවත්',
    eyes: 'ඇස් විශාල / කුඩා',
    age: 'වයස වැඩි / අඩු',
    skin: 'සම සැහැල්ලු / අඳුරු',
  },
}
uiSi.pdf = {
  eyebrow: 'පියවර 4 — නිර්යාත',
  title: 'PDF නිර්යාත',
  description:
    'නඩු ලේඛන සහ අවසර ලැබූ පුද්ගලයින්ට බෙදාහැරීම සඳහා නිල විමර්ශන සංයුක්ත වාර්තාව ජනනය කරන්න.',
  officialReport: 'නිල සංයුක්ත වාර්තාව',
  frontView: 'ඉදිරි දර්ශනය',
  sideProfile: 'පැති පැතිකඩ',
  frontAlt: 'ඉදිරි දර්ශන සංයුක්ත',
  sideAlt: 'පැති පැතිකඩ සංයුක්ත',
  frontPlaceholder: 'ඉදිරි සංයුක්ත',
  sideNotGenerated: 'පැති පැතිකඩ ජනනය නොකළ',
  caseId: 'නඩු ID:',
  date: 'දිනය:',
  investigator: 'විමර්ශක:',
  witnessId: 'සාක්ෂි ID:',
  ageRange: 'වයස් පරාසය:',
  authorizedUser: '[අවසර ලැබූ පරිශීලක]',
  officialStamp: 'නිල භාවිතය පමණි',
  noImagesError:
    'සංයුක්ත රූප ලබා නොදී ඇත. පළමුව ප්‍රතිඵල පිටුවේ ජනනය සම්පූර්ණ කරන්න.',
  exportOptions: 'නිර්යාත විකල්ප',
  leadInvestigator: 'ප්‍රධාන විමර්ශක',
  investigatorPlaceholder: 'නම සහ බැජ් අංකය',
  reportNotes: 'වාර්තා සටහන්',
  notesPlaceholder: 'PDF පාදයේ ඇතුළත් කිරීමට විකල්ප සටහන්',
  backToRefine: 'සංශෝධනයට ආපසු',
  downloadPdf: 'PDF වාර්තාව බාගත කරන්න',
  newSession: 'නව සැසිය',
}
uiSi.loading = {
  default: 'සංයුක්ත චිත්‍රය ජනනය වෙමින්…',
  hint: 'සාක්ෂි විස්තරයෙන් විමර්ශන සංයුක්ත ගොඩනගමින්',
}
uiSi.common = { none: 'නැත' }

const enLocale = { ...ui, options: enOptions }
const siLocale = { ...uiSi, options: siOptions }

writeFileSync(
  new URL('../src/i18n/locales/en.json', import.meta.url),
  JSON.stringify(enLocale, null, 2),
)
writeFileSync(
  new URL('../src/i18n/locales/si.json', import.meta.url),
  JSON.stringify(siLocale, null, 2),
)
console.log('Wrote en.json and si.json')
