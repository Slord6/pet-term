import type { PetSpecies } from "./types.js";

export const blob: PetSpecies = {
  id: "blob",
  name: "Blob",
  frames: [
    [
      " (0    0) "
    ],
    [
      " (0    0) "
    ],
    [
      " (0    0) "
    ],
    [
      " (⋆    ⋆) "
    ],
    [
      " (-    -) "
    ],
    [
      " (⋆    ⋆) "
    ],
    [
      "  (0    0) "
    ],
    [
      " (0    0) "
    ],
    [
      " (0    0) "
    ],
    [
      "  (0    ^) "
    ],
    [
      " (0    0) "
    ],
    [
      " (0    0) "
    ],
    [
      " (0    0) "
    ],
    [
      " (-    0) "
    ],
    [
      " (0    0) "
    ],
    [
      " (0 _  0) "
    ],
    [
      " (0  _ 0) "
    ],
    [
      "  ( 0    0) "
    ],
    [
      "   (0    0)"
    ],
    [
      "   (0  _ 0)"
    ],
    [
      "   (0 _  0)"
    ],
    [
      "  (0    0 )"
    ],
    [
      " (0    0) "
    ],
  ],
  speech: {
    hunger: {
      starving: [
        "I am drying out. I need git soon.",
        "No commits. No squish. Critical.",
        "One more quiet minute and I lose cohesion."
      ],
      hungry: [
        "A small commit would keep me springy.",
        "I could absorb a branch switch.",
        "My blob reserves are running low."
      ],
      content: [
        "That helped. I am pleasantly gelatinous.",
        "Stable squish restored.",
        "A steady flow of work keeps the blob happy."
      ],
      full: [
        "Peak squish achieved.",
        "Excellent. I am full of good commits.",
        "Rich with git nutrients."
      ]
    },
    health: {
      critical: [
        "I am coming apart at the edges.",
        "Blob integrity is failing.",
        "This puddle is in real trouble."
      ],
      weak: [
        "Still cohesive, but only just.",
        "I can recover if you keep things moving.",
        "The wobble is getting harder to hide."
      ],
      steady: [
        "Holding shape nicely.",
        "My surface tension is stable.",
        "This pace keeps me together."
      ],
      thriving: [
        "Glossy. Buoyant. Unstoppable.",
        "Health is high and the squish is immaculate.",
        "I could bounce like this for days."
      ]
    },
    git: {
      commit: [
        "Excellent commit. I have absorbed it.",
        "Fresh code makes for a stronger blob.",
        "That commit landed with a satisfying squish."
      ],
      branchSwitch: [
        "A branch hop. Light but refreshing.",
        "New branch, new texture.",
        "Quick checkout accepted into the mass."
      ]
    },
    ambient: [
      "I rest where the commits pool.",
      "A good repo has a nice bounce to it.",
      "Stillness makes me suspicious.",
      "I could spread into at least three branches from here.",
      "The terminal is warm and pleasantly damp.",
      "I like watching work ripple through a tree."
    ],
    dead: [
      "The blob has gone inert.",
      "No motion left in the puddle.",
      "Surface tension lost. End state reached."
    ]
  }
};
