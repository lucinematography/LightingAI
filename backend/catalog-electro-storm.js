// Official Aputure catalog data verified 2026-09-11.
export const ELECTRO_STORM_FIXTURES = [
  {
    "manufacturer": "Aputure",
    "category": "Light",
    "mount": "Dual Bowens / Aputure Mount",
    "control": [
      "On-board",
      "Sidus Link",
      "DMX/RDM",
      "CRMX",
      "Art-Net",
      "sACN"
    ],
    "ipRating": "IP65",
    "beamAngleDeg": 62,
    "includedReflectorBeamAngleDeg": 35,
    "acInput": "100-240V AC, 50/60Hz",
    "weightKg": 18,
    "weightBasis": "Lamp head without yoke",
    "verifiedAt": "2026-09-11",
    "id": "aputure-electro-storm-xt26",
    "model": "Electro Storm XT26",
    "sourceType": "Tunable White LED",
    "colorMode": "Tunable White",
    "powerDrawW": 3500,
    "outputPowerW": 2600,
    "cctK": {
      "min": 2700,
      "max": 6500
    },
    "cri": 97,
    "tlci": 98,
    "ssi": {
      "tungsten": 84,
      "daylight": 73
    },
    "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26"
  },
  {
    "manufacturer": "Aputure",
    "category": "Light",
    "mount": "Dual Bowens / Aputure Mount",
    "control": [
      "On-board",
      "Sidus Link",
      "DMX/RDM",
      "CRMX",
      "Art-Net",
      "sACN"
    ],
    "ipRating": "IP65",
    "beamAngleDeg": 62,
    "includedReflectorBeamAngleDeg": 35,
    "acInput": "100-240V AC, 50/60Hz",
    "weightKg": 18,
    "weightBasis": "Lamp head without yoke",
    "verifiedAt": "2026-09-11",
    "id": "aputure-electro-storm-cs15",
    "model": "Electro Storm CS15",
    "sourceType": "Dual-blue Full-Color LED",
    "colorMode": "Full Color",
    "powerDrawW": 2200,
    "outputPowerW": 1585,
    "cctK": {
      "min": 2000,
      "max": 10000
    },
    "cri": 98,
    "tlci": 98,
    "ssi": {
      "tungsten": 90,
      "daylight": 86
    },
    "sourceUrl": "https://aputure.com/en-US/products/electro-storm-cs15",
    "verificationNotes": [
      "Uses the published technical-table output of 1585W; the product headline uses 1500W."
    ]
  }
];

export const ELECTRO_STORM_ACCESSORIES = [
  {
    "id": "aputure-electro-storm-motorized-yoke",
    "manufacturer": "Aputure",
    "model": "Motorized Yoke for CS15/XT26",
    "category": "Yoke",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-yoke-for-cs15-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-yoke-for-cs15-xt26"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/motorized-yoke-for-cs15-xt26",
    "verifiedAt": "2026-09-11",
    "panRangeDeg": 540,
    "tiltRangeDeg": 270
  },
  {
    "id": "aputure-motorized-f14-fresnel",
    "manufacturer": "Aputure",
    "model": "Motorized F14 Fresnel",
    "category": "Fresnel",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount",
    "beamAngleDeg": {
      "min": 18,
      "max": 50
    }
  },
  {
    "id": "aputure-f14-barn-doors",
    "manufacturer": "Aputure",
    "model": "F14 Barn Doors",
    "category": "Barn Door",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included with the F14 package, not the standard fixture"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel",
        "requiresAccessoryId": "aputure-motorized-f14-fresnel"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included with the F14 package, not the standard fixture"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel",
        "requiresAccessoryId": "aputure-motorized-f14-fresnel"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-f14-fresnel-yoke",
    "manufacturer": "Aputure",
    "model": "F14 Fresnel Yoke",
    "category": "Yoke",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included with the F14 package"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel",
        "requiresAccessoryId": "aputure-motorized-f14-fresnel"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included with the F14 package"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel",
        "requiresAccessoryId": "aputure-motorized-f14-fresnel"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-electro-storm-skid",
    "manufacturer": "Aputure",
    "model": "Skid for CS15/XT26",
    "category": "Bracket",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included with the F14 package"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included with the F14 package"
        ],
        "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/motorized-f14-fresnel",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-electro-storm-reflector-kit",
    "manufacturer": "Aputure",
    "model": "Reflector Kit for CS15/XT26",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/reflector-kit-for-cs15-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/reflector-kit-for-cs15-xt26"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/reflector-kit-for-cs15-xt26",
    "verifiedAt": "2026-09-11",
    "effectOnLight": "Separate 20° and 50° optics; not a zoom."
  },
  {
    "id": "aputure-electro-storm-20-reflector",
    "manufacturer": "Aputure",
    "model": "Electro Storm 20° Reflector",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/reflector-kit-for-cs15-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/reflector-kit-for-cs15-xt26"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/reflector-kit-for-cs15-xt26",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount",
    "beamAngleDeg": {
      "min": 20,
      "max": 20
    }
  },
  {
    "id": "aputure-electro-storm-35-reflector",
    "manufacturer": "Aputure",
    "model": "Electro Storm 35° Reflector",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-cs15"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount",
    "beamAngleDeg": {
      "min": 35,
      "max": 35
    }
  },
  {
    "id": "aputure-electro-storm-50-reflector",
    "manufacturer": "Aputure",
    "model": "Electro Storm 50° Reflector",
    "category": "Reflector",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/reflector-kit-for-cs15-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/reflector-kit-for-cs15-xt26"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/reflector-kit-for-cs15-xt26",
    "verifiedAt": "2026-09-11",
    "mount": "Aputure Mount",
    "beamAngleDeg": {
      "min": 50,
      "max": 50
    }
  },
  {
    "id": "aputure-electro-storm-head-cable-7-5m",
    "manufacturer": "Aputure",
    "model": "Head Cable for CS15/XT26 (7.5m)",
    "category": "Cable",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/head-cable-for-cs15-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/head-cable-for-cs15-xt26"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/head-cable-for-cs15-xt26",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-electro-storm-head-cable-15m",
    "manufacturer": "Aputure",
    "model": "Head Cable for CS15/XT26 (15m)",
    "category": "Cable",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-cs15"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/head-cable-for-cs15-xt26",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-electro-storm-removable-yoke",
    "manufacturer": "Aputure",
    "model": "Removable Yoke for CS15/XT26",
    "category": "Yoke",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-cs15"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-electro-storm-control-box-dolly",
    "manufacturer": "Aputure",
    "model": "Control Box Dolly for CS15/XT26",
    "category": "Other",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-cs15"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-electro-storm-mount-protection-cover",
    "manufacturer": "Aputure",
    "model": "Electronic Mount Protection Cover for CS15/XT26",
    "category": "Other",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": true,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/products/electro-storm-cs15"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/products/electro-storm-xt26",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-electro-storm-flight-case",
    "manufacturer": "Aputure",
    "model": "Flight Case for CS15/XT26",
    "category": "Other",
    "compatibilityStatus": "Designed For",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included only with a flight-case package"
        ],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Designed For",
        "includedWithFixture": false,
        "conditions": [
          "Included only with a flight-case package"
        ],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26",
    "verifiedAt": "2026-09-11"
  },
  {
    "id": "aputure-spotlight-max-19-lens-kit",
    "manufacturer": "Aputure",
    "model": "Spotlight Max 19° Lens Kit",
    "category": "Spotlight",
    "compatibilityStatus": "Compatible",
    "compatibleWith": [
      "aputure-electro-storm-xt26",
      "aputure-electro-storm-cs15"
    ],
    "compatibility": {
      "aputure-electro-storm-xt26": {
        "status": "Compatible",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
      },
      "aputure-electro-storm-cs15": {
        "status": "Compatible",
        "includedWithFixture": false,
        "conditions": [],
        "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
      }
    },
    "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15",
    "verifiedAt": "2026-09-11",
    "beamAngleDeg": {
      "min": 19,
      "max": 19
    }
  }
];

const RELATIONS = {
  "aputure-spotlight-max-36-lens-kit": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-spotlight-max-50-lens-kit": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-storm-parallel-beam-70": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-sidus-one": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-sidus-four": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-mount-lantern-120": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-mount-light-dome-150": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-lantern-90": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-light-dome-150": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-quick-dome-90": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-space-light-90": {
    "aputure-electro-storm-xt26": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Compatible",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-storm-xt52-35-reflector": {
    "aputure-electro-storm-xt26": {
      "status": "Do Not Use",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Do Not Use",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-storm-series-aputure-mount-protection-cover": {
    "aputure-electro-storm-xt26": {
      "status": "Do Not Use",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Do Not Use",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  },
  "aputure-lantern": {
    "aputure-electro-storm-xt26": {
      "status": "Do Not Use",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-xt26"
    },
    "aputure-electro-storm-cs15": {
      "status": "Do Not Use",
      "includedWithFixture": false,
      "conditions": [],
      "sourceUrl": "https://aputure.com/en-US/pages/accessory-compatibility-wizard?compatModuleProduct=electro-storm-cs15"
    }
  }
};

// Explicit prohibitions belong in compatibility, never in compatibleWith.
export function mergeElectroStormAccessory(accessory) {
  const relations = RELATIONS[accessory.id];
  if (!relations) return accessory;
  const compatibility = { ...(accessory.compatibility || {}), ...relations };
  const targets = new Set([...(accessory.compatibleWith || []), ...Object.keys(relations)]);
  return {
    ...accessory,
    compatibleWith: [...targets].filter(id => compatibility[id]?.status !== 'Do Not Use'),
    compatibility
  };
}
