import type { PetSpecies } from "./types.js";

/**
 * Wolf ascii art
 * MIT License
 * Copyright (c) 2026 petsonality contributors
 * https://github.com/nanami-he/petsonality/blob/main/LICENSE
 */
export const wolf: PetSpecies = {
  id: "wolf",
  name: "Wolf",
  frames: [
    [
      "  _Λ/ᐠ      ",
      " (✦   |__  )",
      "  \\\\  /   - ",
      "  |  |  ||  "
    ],
    [
      "  _Λ/ᐠ      ",
      " (✦   |__  )",
      "  \\\\  /   - ",
      "  |  |  ||  "
    ],
    [
      "  _Λ/ᐠ      ",
      " (-   |__  )",
      "  \\\\  /   - ",
      "  |  |  ||  "
    ],
    [
      "  _Λ/ᐠ      ",
      " (✦   |__  )",
      "  \\\\  /   - ",
      "   | |  ||  "
    ],
    [
      "  _Λ/ᐠ      ",
      " (✦   |__  )",
      "  vv  /   - ",
      "  |  |  ||  "
    ],
    [
      "  _Λ--      ",
      " (✦   |__  )",
      "  \\\\  /   - ",
      "  |  |  ||  "
    ],
    [
      "  _Λ/ᐠ      ",
      " (✦   |__  )",
      "  \\\\  /   - ",
      " |    |  || "
    ],
    [
      "  _Λ/ᐠ      ",
      " (✦_  |__  )",
      "  \\\\  /   - ",
      "  |  |  ||  "
    ]
  ],
  speech: {
    hunger: {
      starving: [
        "The trail has gone cold. I need commits.",
        "No git scent. No strength.",
        "A quiet pack does not eat."
      ],
      hungry: [
        "I could use a branch switch to track.",
        "A commit would sharpen the hunt.",
        "The repos are too still."
      ],
      content: [
        "Good trail. Keep moving.",
        "That work left a clear scent.",
        "Steady enough for the pack."
      ],
      full: [
        "Well fed. The hunt was clean.",
        "Strong commits. Strong teeth.",
        "The wolf is satisfied."
      ]
    },
    health: {
      critical: [
        "The pack is in trouble.",
        "My legs are failing. Move soon.",
        "Too long without momentum."
      ],
      weak: [
        "Still standing, but not for much longer.",
        "The trail is rough today.",
        "I need better signs from the repo."
      ],
      steady: [
        "Pacing well.",
        "Health is holding.",
        "This rhythm keeps me alert."
      ],
      thriving: [
        "Sharp ears. Full stride.",
        "Health is high. The trail is clear.",
        "I could run like this for days."
      ]
    },
    git: {
      commit: [
        "Fresh commit. Good catch.",
        "That landed cleanly.",
        "A strong change for the pack."
      ],
      branchSwitch: [
        "New branch. New trail.",
        "A quick turn through the woods.",
        "Branch scent found."
      ]
    },
    ambient: [
      "I am listening for reflog tracks.",
      "Every branch leaves a scent.",
      "Quiet repos make me pace.",
      "The terminal hums like night air.",
      "A clean commit carries far.",
      "I know when the work goes still."
    ],
    dead: [
      "The wolf has gone quiet.",
      "No tracks remain.",
      "Health reached zero. The trail ends."
    ]
  }
};
