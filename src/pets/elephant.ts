import type { PetSpecies } from "./types.js";

export const elephant: PetSpecies = {
  id: "elephant",
  name: "Elephant",
  frames: [
    [
      "    __  ___ ",
      "   ( •  |  )",
      "    \\ |_  | ",
      "    _) |__| "
    ],
    [
      "    __  ___ ",
      "   ( •  |  )",
      "    \\ |_  | ",
      "   _)  |__| "
    ],
    [
      "    __  ___ ",
      "   ( -  |  )",
      "    \\ |_  | ",
      "    _) |__| "
    ],
    [
      "    __  ___ ",
      "   ( •  |  )",
      "    \\ |_  | ",
      "    _) |_ | "
    ],
    [
      "    __  ___ ",
      "   ( •  |  )",
      "    \\ |_  | ",
      "    _) | _| "
    ],
    [
      "    __  ___ ",
      "   ( •  |  )",
      "    \\ |_  | ",
      "   _/  |__| "
    ],
    [
      "   __ _____ ",
      "   ( •  |  )",
      "    \\ |_  | ",
      "    _) |__| "
    ],
    [
      "    __  ___ ",
      "   ( –  |  )",
      "    \\ |_  | ",
      "    _) |__| "
    ]
  ],
  speech: {
    hunger: {
      starving: [
        "The grove is empty. I need commits.",
        "No git activity. Heavy going.",
        "I cannot march on silence."
      ],
      hungry: [
        "A branch switch would help.",
        "I could use a fresh commit.",
        "The work trail is getting thin."
      ],
      content: [
        "Good. The path is steady.",
        "That will keep me moving.",
        "A measured pace suits me."
      ],
      full: [
        "Well fed. Strong steps.",
        "Excellent work. The herd moves on.",
        "Plenty of git to remember."
      ]
    },
    health: {
      critical: [
        "I am slowing badly.",
        "This path is too quiet.",
        "My strength is almost gone."
      ],
      weak: [
        "Still moving, but slowly.",
        "The trail needs attention.",
        "I need steadier work soon."
      ],
      steady: [
        "Health is steady.",
        "The march continues.",
        "This pace is dependable."
      ],
      thriving: [
        "Strong memory. Strong stride.",
        "Health is high. Keep the path clear.",
        "I could carry this for days."
      ]
    },
    git: {
      commit: [
        "A commit worth remembering.",
        "Fresh work. Solid step.",
        "That change carries weight."
      ],
      branchSwitch: [
        "New branch. New path.",
        "A careful turn.",
        "Branch change noted."
      ]
    },
    ambient: [
      "I remember every branch.",
      "Quiet repos make long shadows.",
      "The terminal path is familiar.",
      "Good commits leave deep tracks.",
      "I am listening for distant work.",
      "Slow and steady still needs motion."
    ],
    dead: [
      "The elephant has gone still.",
      "No more steps on this path.",
      "Health reached zero. The march ends."
    ]
  }
};
