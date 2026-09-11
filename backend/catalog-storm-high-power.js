// Verified against official Aputure specifications and compatibility pages on 2026-09-11.
// outputPowerW is the published LED output rating, not photometric output or HMI equivalence.
export const HIGH_POWER_STORM_FIXTURES = [
  {
    "manufacturer": "Aputure",
    "category": "Light",
    "mount": "Aputure Mount",
    "control": [
      "On-board",
      "Sidus Link",
      "Sidus Link Pro",
      "DMX",
      "CRMX",
      "Art-Net",
      "sACN"
    ],
    "ipRating": "IP65",
    "verifiedAt": "2026-09-11",
    "id": "aputure-storm-xt52",
    "model": "STORM XT52",
    "sourceType": "BLAIR Full-Spectrum LED",
    "powerDrawW": 5600,
    "outputPowerW": 4800,
    "lampHeadPowerDrawW": 5200,
    "powerDrawExtendedCableW": 6000,
    "powerDrawLowVoltageW": 3200,
    "cctK": {
      "min": 2500,
      "max": 10000
    },
    "colorMode": "Tunable White + Limited Color",
    "cri": 96,
    "tlci": 96,
    "colorMetricQualifier": ">96 for CRI and TLCI",
    "ssi": {
      "tungsten": 87,
      "daylight": 88
    },
    "beamAngleDeg": 93,
    "includedReflectorBeamAngleDeg": 35,
    "acInput": "100-240V AC, 50/60Hz; full output at 180-240V",
    "weightKg": 31.3,
    "weightBasis": "Lamp head with yoke",
    "lampHeadWithoutYokeKg": 27.8,
    "controlBoxWeightKg": 13.4,
    "sourceUrl": "https://aputure.com/en-US/products/storm-xt52",
    "specificationSourceUrl": "https://docs.aputure.com/hubfs/Knowledge%20Base/Aputure_Storm_XT52_One_Sheet_2025-06-17a.pdf",
    "verificationNotes": [
      "Power and SSI follow the specification table and data sheet; page narrative instead quotes 5200W system draw and SSI D56 86."
    ]
  },
  {
    "manufacturer": "Aputure",
    "category": "Light",
    "mount": "Aputure Mount",
    "control": [
      "On-board",
      "Sidus Link",
      "Sidus Link Pro",
      "DMX",
      "CRMX",
      "Art-Net",
      "sACN"
    ],
    "ipRating": "IP65",
    "verifiedAt": "2026-09-11",
    "id": "aputure-storm-cs32",
    "model": "STORM CS32",
    "sourceType": "BLAIR-CG With Extended Red",
    "powerDrawW": 3200,
    "outputPowerW": 2600,
    "lampHeadPowerDrawW": 3000,
    "cctK": {
      "min": 1800,
      "max": 20000
    },
    "colorMode": "Full Color",
    "colorGamut": "90%+ Rec.2020",
    "cri": 97,
    "tlci": 98,
    "ssi": {
      "tungsten": 93,
      "daylight": 91
    },
    "beamAngleDeg": 78,
    "includedReflectorBeamAngleDeg": 30,
    "acInput": "100-240V AC, 50/60Hz",
    "weightKg": 19.8,
    "weightBasis": "Lamp head with yoke",
    "lampHeadWithoutYokeKg": 16.8,
    "controlBoxWeightKg": 10.8,
    "sourceUrl": "https://aputure.com/en-US/products/storm-cs32"
  }
];

export const HIGH_POWER_STORM_ACCESSORIES = [
  {
    "id": "aputure-motorized-cf16-fresnel",
    "manufacturer": "Aputure",
    "model": "Motorized CF16 Fresnel",
    "category": "Fresnel",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-cf16-fresnel"
      },
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included in CS32 Cine Kit only; optional for the standard fixture"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/storm-cs32-cine-kit"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/motorized-cf16-fresnel",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount",
    "beamAngleDeg": {
      "min": 18,
      "max": 50
    },
    "effectOnLight": "Motorized spot-to-flood focus."
  },
  {
    "id": "aputure-cf16-barn-doors",
    "manufacturer": "Aputure",
    "model": "CF16 Barn Doors",
    "category": "Barn Door",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included with CF16 Fresnel"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-cf16-fresnel",
        "requiresAccessoryId": "aputure-motorized-cf16-fresnel"
      },
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included in CS32 Cine Kit only; optional for the standard fixture"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/storm-cs32-cine-kit",
        "requiresAccessoryId": "aputure-motorized-cf16-fresnel"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/motorized-cf16-fresnel",
    "verifiedAt": "2026-09-11",
    "effectOnLight": "Beam shaping for CF16."
  },
  {
    "id": "aputure-cf16-manual-focus-cover",
    "manufacturer": "Aputure",
    "model": "CF16 Fresnel Manual Focus Cover",
    "category": "Other",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-cf16-fresnel",
        "requiresAccessoryId": "aputure-motorized-cf16-fresnel"
      },
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-cf16-fresnel",
        "requiresAccessoryId": "aputure-motorized-cf16-fresnel"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/motorized-cf16-fresnel",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-parallel-beam-70",
    "manufacturer": "Aputure",
    "model": "STORM Parallel Beam 70",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-parallel-beam-70"
      },
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-parallel-beam-70"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-parallel-beam-70",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount",
    "beamAngleDeg": {
      "min": 5,
      "max": 5
    },
    "effectOnLight": "Narrow parallel beam."
  },
  {
    "id": "aputure-mount-light-dome-150",
    "manufacturer": "Aputure",
    "model": "Aputure Mount Light Dome 150",
    "category": "Dome",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-xt52"
      },
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount"
  },
  {
    "id": "aputure-mount-lantern-120",
    "manufacturer": "Aputure",
    "model": "Aputure Mount Lantern 120",
    "category": "Lantern",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-xt52"
      },
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount"
  },
  {
    "id": "aputure-mount-lantern-180",
    "manufacturer": "Aputure",
    "model": "Aputure Mount Lantern 180",
    "category": "Lantern",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount"
  },
  {
    "id": "aputure-storm-xt52-reflector-kit",
    "manufacturer": "Aputure",
    "model": "STORM XT52 Reflector Kit",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit"
      },
      "aputure-storm-cs32": {
        "status": "Compatible",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit",
    "verifiedAt": "2026-09-11",
    "effectOnLight": "25° and 50° reflectors plus 20° extension; discrete options, not zoom."
  },
  {
    "id": "aputure-storm-xt52-25-reflector",
    "manufacturer": "Aputure",
    "model": "STORM XT52 25° Reflector",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit"
      },
      "aputure-storm-cs32": {
        "status": "Compatible",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit",
    "verifiedAt": "2026-09-11",
    "beamAngleDeg": {
      "min": 25,
      "max": 25
    }
  },
  {
    "id": "aputure-storm-xt52-50-reflector",
    "manufacturer": "Aputure",
    "model": "STORM XT52 50° Reflector",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit"
      },
      "aputure-storm-cs32": {
        "status": "Compatible",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit",
    "verifiedAt": "2026-09-11",
    "beamAngleDeg": {
      "min": 50,
      "max": 50
    }
  },
  {
    "id": "aputure-storm-xt52-20-reflector",
    "manufacturer": "Aputure",
    "model": "STORM XT52 20° Reflector Extension",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Extension for the 25° reflector"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit",
        "requiresAccessoryId": "aputure-storm-xt52-25-reflector"
      },
      "aputure-storm-cs32": {
        "status": "Compatible",
        "includedWithFixture": false,
        "conditions": [
          "Extension for the 25° reflector"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit",
        "requiresAccessoryId": "aputure-storm-xt52-25-reflector"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-xt52-reflector-kit",
    "verifiedAt": "2026-09-11",
    "beamAngleDeg": {
      "min": 20,
      "max": 20
    }
  },
  {
    "id": "aputure-storm-xt52-35-reflector",
    "manufacturer": "Aputure",
    "model": "STORM XT52 35° Medium Reflector",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52"
      },
      "aputure-storm-cs32": {
        "status": "Compatible",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-xt52",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount",
    "beamAngleDeg": {
      "min": 35,
      "max": 35
    }
  },
  {
    "id": "aputure-storm-cs32-30-reflector",
    "manufacturer": "Aputure",
    "model": "STORM CS32 AM11030 Medium Reflector",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-cs32",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount",
    "beamAngleDeg": {
      "min": 30,
      "max": 30
    }
  },
  {
    "id": "aputure-storm-xt52-head-cable-7-5m",
    "manufacturer": "Aputure",
    "model": "Y50X-2011 Head Cable (7.5m)",
    "category": "Cable",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-xt52",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-xt52-head-cable-15m",
    "manufacturer": "Aputure",
    "model": "Y50X-2011 Head Cable (15m)",
    "category": "Cable",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-xt52"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-xt52",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-xt52-removable-yoke",
    "manufacturer": "Aputure",
    "model": "STORM XT52 Removable Yoke",
    "category": "Yoke",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-xt52",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-xt52-skid",
    "manufacturer": "Aputure",
    "model": "STORM XT52 Skid",
    "category": "Bracket",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-xt52"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-xt52",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-cs32-head-cable-7-5m",
    "manufacturer": "Aputure",
    "model": "PLK28 10-Pin Head Cable (7.5m)",
    "category": "Cable",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-cs32",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-cs32-head-cable-15m",
    "manufacturer": "Aputure",
    "model": "PLK28 10-Pin Head Cable (15m)",
    "category": "Cable",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-cs32-removable-yoke",
    "manufacturer": "Aputure",
    "model": "STORM CS32 Removable Yoke",
    "category": "Yoke",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/storm-cs32",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-cs32-skid",
    "manufacturer": "Aputure",
    "model": "STORM CS32 Skid",
    "category": "Bracket",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included in CS32 Cine Kit only; optional for the standard fixture"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/storm-cs32-cine-kit"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-cs32-air-deflector",
    "manufacturer": "Aputure",
    "model": "STORM CS32 Air Deflector",
    "category": "Other",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-storm-series-aputure-mount-protection-cover",
    "manufacturer": "Aputure",
    "model": "STORM Series Aputure Mount Protection Cover",
    "category": "Other",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-storm-xt52",
      "aputure-storm-cs32"
    ],
    "compatibility": {
      "aputure-storm-xt52": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-xt52"
      },
      "aputure-storm-cs32": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/storm-cs32"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-xt52",
    "verifiedAt": "2026-09-11"
  }
];

const CONTROL_RELATIONS = {
  "aputure-sidus-one": {
    "aputure-storm-xt52": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-xt52"
    },
    "aputure-storm-cs32": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32"
    }
  },
  "aputure-sidus-four": {
    "aputure-storm-cs32": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=storm-cs32"
    }
  }
};

export function mergeHighPowerStormAccessory(accessory) {
  const relations = CONTROL_RELATIONS[accessory.id];
  if (!relations) return accessory;
  return {
    ...accessory,
    compatibleWith: [...new Set([...(accessory.compatibleWith || []), ...Object.keys(relations)])],
    compatibility: { ...(accessory.compatibility || {}), ...relations }
  };
}
