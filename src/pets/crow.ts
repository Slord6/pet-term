import type { PetSpecies } from "./types.js";

/**
 * Crow ascii art
 * MIT License
 * Copyright (c) 2026 petsonality contributors
 * https://github.com/nanami-he/petsonality/blob/main/LICENSE
 */

export const crow: PetSpecies = {
  id: "crow",
  name: "Crow",
  frames: [
    [
      "  <(✦)      ",
      "   (\\ \\_    ",
      "    \\\\//    ",
      "  --\" \"---  "
    ],
    [
      "  <(✦)      ",
      "   (\\\\ \\_   ",
      "    \\\\//    ",
      "  --\" \"---  "
    ],
    [
      "  <(✧)      ",
      "   (\\ \\_    ",
      "    \\\\//    ",
      "  --\" \"---  "
    ],
    [
      "   (✦)>     ",
      "   (\\ \\_    ",
      "    \\\\//    ",
      "  --\" \"---  "
    ],
    [
      "   (✦)>     ",
      "   (\\ \\_    ",
      "    \\\\//    ",
      "  --\" -\"--  "
    ],
    [
      "    (✦)>    ",
      "    (\\ \\_   ",
      "     \\\\//   ",
      "  ---\"-\"--  "
    ],
    [
      "    (✧)>    ",
      "    (\\ \\_   ",
      "     \\\\//   ",
      "  ---\"-\"--  "
    ],
    [
      "    (-)>    ",
      "    (\\ \\_   ",
      "     \\\\//   ",
      "  ---\"-\"--  "
    ],
    [
      "   (✦)>     ",
      "   (\\ \\_    ",
      "    \\\\//    ",
      "  --\" -\"--  "
    ]
  ],
  speech: {
    hunger: {
      starving: [
        "No crumbs. No commits. Dire.",
        "The branch is silent. I am not thriving.",
        "Feed me a change worth keeping."
      ],
      hungry: [
        "A snack would steady the wings.",
        "I could use a branch hop or a commit.",
        "The pantry of git is looking sparse."
      ],
      content: [
        "Better. The repos still have life.",
        "That should do for now.",
        "A decent pace keeps the feathers neat."
      ],
      full: [
        "Well fed. Keep shipping.",
        "Excellent. The crow approves.",
        "A healthy stash of git snacks."
      ]
    },
    health: {
      critical: [
        "This is a bad state. Fix it.",
        "My health is failing. I need attention.",
        "Too long in the red."
      ],
      weak: [
        "I am holding together, barely.",
        "Not dead yet. Improve the trend.",
        "The feathers are a bit rough today."
      ],
      steady: [
        "Steady enough.",
        "Health is stabilising.",
        "This pace is workable."
      ],
      thriving: [
        "Strong wings. Sharp beak. Good work.",
        "Health is high. Keep the rhythm.",
        "I could fly like this for days."
      ]
    },
    git: {
      commit: [
        "A full meal. Good commit.",
        "Commit accepted. Nutrition restored.",
        "Fresh code. Fresh energy."
      ],
      branchSwitch: [
        "A branch switch. Small snack.",
        "Different branch, different crumbs.",
        "A quick checkout. I will take it."
      ]
    },
    ambient: [
      "I am watching the reflogs.",
      "Every branch tells on you eventually.",
      "Quiet repos make for a nervous crow.",
      "There is always one more clean commit.",
      "I prefer motion to dust.",
      "The terminal is a fine perch."
    ],
    dead: [
      "No more cawing.",
      "The crow has gone still.",
      "Health reached zero. End of watch."
    ]
  }
};
