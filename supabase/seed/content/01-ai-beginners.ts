import type { SeedLesson } from "../types"

export const aiBeginnersLessons: SeedLesson[] = [
  {
    worldSlug: "ai-beginners",
    slug: "what-is-artificial-intelligence",
    title: "What Is Artificial Intelligence?",
    description:
      "Meet artificial intelligence: computer programs that learn from examples to do jobs that usually need human thinking.",
    estimatedMinutes: 8,
    difficulty: "beginner",
    learningObjectives: [
      "Explain in your own words what artificial intelligence (AI) is.",
      "Describe how AI learns from examples called data.",
      "Name two things AI can do and one thing it cannot.",
    ],
    transcript: `Artificial intelligence, or AI for short, is a kind of computer program that can do jobs we normally think need human brainpower, like recognising a face in a photo, understanding spoken words or suggesting the next song.

Ordinary programs follow exact step-by-step instructions written by a person. AI is different. Instead of being told every step, it is shown lots and lots of examples and finds patterns in them. Those examples are called data, and the practice is called training.

Imagine teaching a friend to spot ripe bananas. You would not write a rule book. You would show them many bananas: green ones, yellow ones and spotty brown ones. After a while they just get it. AI learns in a similar way, except it might look at millions of pictures.

AI is clever at the one job it has been trained for, but it does not understand the world the way you do. It has no feelings, no wishes and no common sense. It is a tool made by people, and a very useful one when we use it carefully.`,
    keyTerms: [
      {
        term: "Artificial intelligence (AI)",
        definition:
          "Computer programs that can do tasks which usually need human thinking, such as recognising pictures or understanding speech.",
      },
      {
        term: "Data",
        definition: "Information, such as pictures, words or numbers, that an AI learns from.",
      },
      {
        term: "Training",
        definition: "Showing an AI many examples so that it can find patterns.",
      },
      {
        term: "Pattern",
        definition: "Something that repeats in a way you can spot and use to make a good guess.",
      },
    ],
    keyTakeaways: [
      "AI is a computer program, not a living thing.",
      "AI learns by finding patterns in lots of examples.",
      "AI is a tool made and guided by people.",
    ],
    advantages: [
      "Can sort through huge amounts of information very quickly.",
      "Does not get tired or bored doing the same job again and again.",
      "Can help people with tasks such as translating languages or spotting patterns in the weather.",
    ],
    limitations: [
      "Only knows what was in the examples it learned from.",
      "Has no feelings, common sense or real understanding.",
      "Can be confidently wrong, especially about things it was never trained on.",
    ],
    safetyNotes: [
      "Remember that an AI is a tool, not a person or a friend who knows you.",
      "If an AI tells you something important, check it with a trusted adult or another source.",
    ],
    quiz: {
      instructions: "Five quick questions about what AI is and how it learns. Take your time!",
      passingScore: 60,
      questions: [
        {
          question: "What is artificial intelligence?",
          options: [
            { text: "A robot that is alive" },
            { text: "A computer program that can do tasks that usually need human thinking", correct: true },
            { text: "A very fast internet connection" },
            { text: "A type of games console" },
          ],
          explanation:
            "AI is a kind of computer program. It can do some tasks that normally need human thinking, but it is not alive.",
        },
        {
          question: "How does an AI usually learn to do its job?",
          options: [
            { text: "By finding patterns in lots of examples", correct: true },
            { text: "By going to school with children" },
            { text: "By reading people's minds" },
            { text: "By guessing at random for ever" },
          ],
          explanation: "An AI is trained on many examples and finds the patterns in them.",
        },
        {
          question: "What do we call the examples an AI learns from?",
          options: [
            { text: "Batteries" },
            { text: "Wires" },
            { text: "Data", correct: true },
            { text: "Passwords" },
          ],
          explanation: "The pictures, words and numbers an AI learns from are called data.",
        },
        {
          question: "Which of these is true about AI?",
          options: [
            { text: "It has feelings just like you" },
            { text: "It always tells the truth" },
            { text: "It understands everything in the world" },
            { text: "It is a tool made by people", correct: true },
          ],
          explanation:
            "AI is a tool that people build and guide. It has no feelings and it can be wrong.",
        },
        {
          question:
            "An AI was trained only on pictures of cats and dogs. What might happen if you show it a giraffe?",
          options: [
            { text: "It will certainly say “giraffe”" },
            { text: "It may give a wrong answer because it never learned about giraffes", correct: true },
            { text: "It will switch itself off" },
            { text: "It will ask a teacher" },
          ],
          explanation:
            "An AI only knows what it was trained on. Shown something new, it may still guess, and guess wrong.",
        },
      ],
    },
  },
  {
    worldSlug: "ai-beginners",
    slug: "can-machines-think-like-humans",
    title: "Can Machines Think Like Humans?",
    description:
      "Computers can be brilliant at some puzzles, but is that the same as thinking? Compare how machines and people work things out.",
    estimatedMinutes: 9,
    difficulty: "beginner",
    learningObjectives: [
      "Compare how people think with how AI works.",
      "Explain why sounding clever is not the same as understanding.",
      "Give examples of things humans are better at than AI.",
    ],
    transcript: `A computer can beat a chess champion and add up a million numbers in a blink. So can machines think like we do? Not really, and the difference is interesting.

When you think, you use much more than facts. You use your senses, your memories, your feelings and your common sense. You know that ice cream melts in the sun and that a friend who is crying might need a hug. Nobody had to show you a million examples.

An AI works by spotting patterns in data and using them to predict a good answer. A chatbot, for example, predicts which words are likely to come next. Its sentences can sound friendly and wise, but it does not actually know what a hug feels like. It has never been cold, hungry or happy.

That is why people say AI imitates thinking. It is a little like a parrot that can say “hello” perfectly without knowing what a greeting is, although this parrot has studied a huge library.

Humans and machines are good at different things. Machines are fast and tireless. People are curious, kind and creative, and can understand why something matters. The best results come when people stay in charge and use AI as a helper.`,
    keyTerms: [
      {
        term: "Prediction",
        definition: "A careful guess about what comes next, based on patterns.",
      },
      {
        term: "Common sense",
        definition:
          "Everyday knowledge about how the world works, which people pick up simply by living in it.",
      },
      { term: "Imitate", definition: "To copy how something looks or sounds." },
      {
        term: "Chatbot",
        definition: "An AI program you can type or talk to, which replies in sentences.",
      },
    ],
    keyTakeaways: [
      "AI predicts answers from patterns; it does not understand like a person.",
      "Sounding confident is not the same as being right.",
      "People bring feelings, common sense and judgement that machines do not have.",
    ],
    advantages: [
      "Machines can calculate and search far faster than people.",
      "AI can practise a task millions of times without getting tired.",
      "AI can free people to spend more time on creative and caring work.",
    ],
    limitations: [
      "AI has no feelings, experiences or common sense.",
      "AI cannot truly understand why something is right or wrong.",
      "AI can sound very sure even when its answer is mistaken.",
    ],
    safetyNotes: [
      "A chatbot may sound like a friend, but it is a program. Talk to real people you trust about your feelings and worries.",
      "Do not let an AI make important decisions for you. Ask a trusted adult.",
    ],
    quiz: {
      instructions: "Can you tell the difference between thinking and predicting? Five questions.",
      passingScore: 60,
      questions: [
        {
          question: "How does a chatbot decide what to write?",
          options: [
            { text: "It asks another person secretly" },
            { text: "It remembers its own childhood" },
            { text: "It predicts which words are likely to come next", correct: true },
            { text: "It reads your mind" },
          ],
          explanation:
            "A chatbot has learned patterns in language and predicts the words most likely to fit.",
        },
        {
          question: "Which of these can a human do that an AI cannot?",
          options: [
            { text: "Add up numbers" },
            { text: "Actually feel happy or sad", correct: true },
            { text: "Sort a list of names" },
            { text: "Store lots of facts" },
          ],
          explanation: "AI can describe feelings using words, but it does not have any.",
        },
        {
          question: "An AI gives an answer that sounds very confident. What does that tell you?",
          options: [
            { text: "The answer must be correct" },
            { text: "The AI is alive" },
            { text: "The AI is angry" },
            { text: "Nothing for certain. It could still be wrong", correct: true },
          ],
          explanation: "AI often sounds just as sure when it is wrong as when it is right.",
        },
        {
          question: "Why do people say that AI “imitates” thinking?",
          options: [
            { text: "Because it copies patterns of human language without truly understanding them", correct: true },
            { text: "Because it has a brain made of jelly" },
            { text: "Because it copies homework" },
            { text: "Because it only works at night" },
          ],
          explanation:
            "AI produces language that looks like thinking by following patterns, not by understanding.",
        },
        {
          question: "What is the best way for people and AI to work together?",
          options: [
            { text: "Let the AI decide everything" },
            { text: "Never use AI at all" },
            { text: "People stay in charge and use AI as a helper", correct: true },
            { text: "Do whatever the AI says as fast as possible" },
          ],
          explanation:
            "AI is most useful as a helper. People should set the goals and make the decisions.",
        },
      ],
    },
  },
]
