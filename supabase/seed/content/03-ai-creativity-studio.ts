import type { SeedLesson } from "../types"

export const aiCreativityStudioLessons: SeedLesson[] = [
  {
    worldSlug: "ai-creativity-studio",
    slug: "can-ai-create-a-photograph",
    title: "Can AI Create a Photograph?",
    description:
      "AI can turn a sentence into a picture that looks like a photo. Learn how it works and why that picture is not a real photograph.",
    estimatedMinutes: 9,
    difficulty: "beginner",
    learningObjectives: [
      "Explain the difference between a photograph and an AI-generated image.",
      "Describe how a text prompt becomes a picture.",
      "Spot clues that an image might have been made by AI.",
    ],
    transcript: `A photograph is made when a camera captures light from a real moment: your dog jumping, a sunset, a birthday cake. Something really happened in front of the lens.

An AI image generator works differently. You type a description, called a prompt, such as “a purple elephant skateboarding on the Moon”, and the AI builds a brand-new picture to match.

How? During training, the AI studied an enormous number of pictures together with words describing them. It learned patterns: what fur looks like, how shadows fall, what a skateboard usually looks like. When you give it a prompt, it starts from a blur of random dots and improves it step by step until the picture matches the words.

The result can look just like a photo. But no camera was there and that moment never happened. So it is more accurate to call it an AI-generated image than a photograph.

Sometimes there are clues: strange hands, jumbled writing on signs, or earrings that do not match. But the tools are improving quickly, so you cannot always tell just by looking.

AI images can be wonderful for imagination and play. The important part is honesty: say when a picture was made with AI, and never use one to trick anybody.`,
    keyTerms: [
      { term: "Prompt", definition: "The words you give an AI to tell it what to make." },
      {
        term: "AI-generated image",
        definition: "A picture created by an AI program rather than captured by a camera.",
      },
      {
        term: "Image generator",
        definition: "An AI tool that makes pictures from descriptions.",
      },
      { term: "Label", definition: "A note that tells people how something was made." },
    ],
    keyTakeaways: [
      "A photograph captures a real moment; an AI image is built from learned patterns.",
      "AI images can look real even though the scene never happened.",
      "Be honest: say when a picture was made with AI.",
    ],
    advantages: [
      "Lets you picture things that could never be photographed, like a dragon in your garden.",
      "Helps people sketch ideas quickly for stories, games and projects.",
      "Makes creating pictures possible for people who find drawing difficult.",
    ],
    limitations: [
      "Can make mistakes, such as odd hands or scrambled writing.",
      "Can be used to make things look real when they never happened.",
      "Learns from pictures made by human artists, which raises questions about fairness and permission.",
    ],
    safetyNotes: [
      "Never upload photos of yourself, your friends or your family to an AI tool without a trusted adult's permission.",
      "Never make or share a fake picture of a real person. It can hurt people.",
      "If a picture online looks amazing or shocking, ask “Could this be AI?” before you believe or share it.",
    ],
    quiz: {
      instructions: "Photo or AI picture? Five questions to test your eye.",
      passingScore: 60,
      questions: [
        {
          question: "What is a prompt?",
          options: [
            { text: "A type of camera lens" },
            { text: "The words you give an AI to tell it what to make", correct: true },
            { text: "A battery charger" },
            { text: "A photo frame" },
          ],
          explanation: "A prompt is the description you type to tell the AI what you want.",
        },
        {
          question: "What is the main difference between a photograph and an AI-generated image?",
          options: [
            { text: "Photographs are always in colour" },
            { text: "AI images are always cartoons" },
            { text: "There is no difference" },
            {
              text: "A photograph captures a real moment; an AI image is built from learned patterns",
              correct: true,
            },
          ],
          explanation:
            "A camera records something that really happened. An AI image shows a scene that never existed.",
        },
        {
          question: "Which could be a clue that an image was made by AI?",
          options: [
            { text: "Writing on a sign is jumbled nonsense", correct: true },
            { text: "It has a blue sky" },
            { text: "It shows an animal" },
            { text: "It is a rectangle" },
          ],
          explanation:
            "AI images sometimes contain scrambled writing or odd details, although not always.",
        },
        {
          question: "What is the honest thing to do when you share a picture made with AI?",
          options: [
            { text: "Say a famous artist drew it" },
            { text: "Pretend you took it with a camera" },
            { text: "Say that it was made with AI", correct: true },
            { text: "Say nothing and hope nobody asks" },
          ],
          explanation: "Telling people how a picture was made means nobody is tricked.",
        },
        {
          question: "Before uploading a photo of a friend to an AI tool, you should…",
          options: [
            { text: "Do it quickly so nobody notices" },
            { text: "Have permission and ask a trusted adult", correct: true },
            { text: "Add their home address" },
            { text: "Share it everywhere first" },
          ],
          explanation:
            "A photo of a person is personal information. You need permission, and an adult should help.",
        },
      ],
    },
  },
  {
    worldSlug: "ai-creativity-studio",
    slug: "how-can-ai-help-us-write-stories",
    title: "How Can AI Help Us Write Stories?",
    description:
      "AI can suggest ideas, characters and plot twists. Find out how to use it as a writing helper while keeping the story your own.",
    estimatedMinutes: 8,
    difficulty: "beginner",
    learningObjectives: [
      "Describe ways an AI can help with story writing.",
      "Explain why your own ideas and voice matter.",
      "Use AI help honestly and check what it writes.",
    ],
    transcript: `Every writer gets stuck sometimes. You have a brave hero and a spooky castle, but what happens next? This is where an AI writing helper can be useful.

AI writing tools have been trained on enormous amounts of text. From that, they learned patterns in how words and stories fit together. When you ask a question, the AI predicts words that make a sensible reply.

That makes it a handy brainstorming partner. You could ask for ten unusual names for a dragon, three ways your hero might escape a locked tower, or a different word for “walked”. You pick the ideas you like, change them and throw the rest away.

But there are things the AI does not have: your life, your feelings and your sense of humour. It has never been nervous on the first day of school or laughed until its tummy hurt. Those things make your story different from everyone else's. If the AI writes the whole thing, the story may sound flat and a bit like many others, and it will not really be yours.

AI can also get facts wrong, so check anything that is meant to be true.

Think of AI as a helper sitting beside you, not as the author. And be honest: if AI helped, say so, and follow your school's rules.`,
    keyTerms: [
      {
        term: "Brainstorm",
        definition: "To come up with lots of ideas quickly, without worrying whether they are perfect.",
      },
      {
        term: "Draft",
        definition: "An early version of a piece of writing that you plan to improve.",
      },
      {
        term: "Author",
        definition: "The person who creates a piece of writing and is responsible for it.",
      },
      { term: "Plot", definition: "The main events that happen in a story." },
    ],
    keyTakeaways: [
      "AI is a useful brainstorming partner when you are stuck.",
      "Your experiences and imagination make a story truly yours.",
      "Be honest about AI help and check any facts.",
    ],
    advantages: [
      "Offers lots of ideas quickly when you feel stuck.",
      "Can suggest new words and different ways to say something.",
      "Can ask you questions that help you plan your story.",
    ],
    limitations: [
      "Has no real experiences or feelings to write from.",
      "Its stories can sound similar to many others.",
      "May include mistakes or made-up facts.",
    ],
    safetyNotes: [
      "Do not type your full name, address, school or other private details into an AI tool.",
      "Handing in AI writing as your own work is not honest. Follow your teacher's rules.",
      "If an AI writes something that feels scary or unkind, stop and tell a trusted adult.",
    ],
    quiz: {
      instructions: "Five questions about writing with an AI helper.",
      passingScore: 60,
      questions: [
        {
          question: "Which is a good way to use AI when writing a story?",
          options: [
            { text: "Let it write everything and put your name on it" },
            { text: "Type in your home address to make it realistic" },
            { text: "Ask it for ideas when you are stuck, then choose and change them yourself", correct: true },
            { text: "Copy another child's story" },
          ],
          explanation:
            "AI works best as a brainstorming partner. You stay the author by choosing and shaping the ideas.",
        },
        {
          question: "What does “brainstorm” mean?",
          options: [
            { text: "To come up with lots of ideas quickly", correct: true },
            { text: "To have a headache" },
            { text: "A type of thunderstorm" },
            { text: "To delete your work" },
          ],
          explanation: "Brainstorming means collecting many ideas first and choosing the best later.",
        },
        {
          question: "What makes your story different from a story written by an AI?",
          options: [
            { text: "Using longer words" },
            { text: "Typing faster" },
            { text: "A fancier font" },
            { text: "Your own experiences, feelings and imagination", correct: true },
          ],
          explanation: "Only you have lived your life. That is what makes your writing yours.",
        },
        {
          question:
            "An AI helper adds a “fact” to your story about how tall a mountain is. What should you do?",
          options: [
            { text: "Trust it completely" },
            { text: "Check it using a reliable source", correct: true },
            { text: "Make the number bigger" },
            { text: "Remove every fact from the story" },
          ],
          explanation: "AI can invent facts that sound right. Check them before you use them.",
        },
        {
          question: "If AI helped with your homework, what is the honest thing to do?",
          options: [
            { text: "Hide it" },
            { text: "Blame a friend" },
            { text: "Say so and follow your school's rules", correct: true },
            { text: "Say the dog wrote it" },
          ],
          explanation: "Being open about AI help is honest, and it lets your teacher support you.",
        },
      ],
    },
  },
]
