import type { SeedLesson } from "../types"

export const aiSafetySchoolLessons: SeedLesson[] = [
  {
    worldSlug: "ai-safety-school",
    slug: "why-never-share-personal-information-with-ai",
    title: "Why Should We Never Share Personal Information With AI?",
    description:
      "Chatbots can feel friendly, but they are not the place for private details. Learn what personal information is and how to protect it.",
    estimatedMinutes: 9,
    difficulty: "beginner",
    learningObjectives: [
      "Identify what counts as personal information.",
      "Explain what can happen to information typed into an AI tool.",
      "Practise safe ways to ask AI for help.",
    ],
    transcript: `Chatting to an AI can feel like talking to a helpful friend. It answers politely, never gets bored and is always there. So it is easy to forget an important fact: an AI chatbot is a computer service run by a company, and what you type does not simply vanish.

Depending on the tool, your messages may be stored, read by people who work on the service, or used to help train future versions of the AI. Once information is out, you cannot easily pull it back.

That is why we keep personal information out of AI chats. Personal information is anything that could show who you are or where to find you: your full name, home address, school, phone number, passwords, photos of you, and details about your health or your family.

The good news is that you almost never need those details to get help. Instead of “I am Mia Carter from Oak Road School and I need help with fractions”, you can simply write “Can you explain fractions with an example?”

Many AI tools are also made for adults and have age rules, so always use them with a trusted grown-up's permission.

Here is a simple test: would I be happy for this to be read out in assembly? If not, do not type it.`,
    keyTerms: [
      {
        term: "Personal information",
        definition:
          "Details that could identify you or help someone find you, such as your full name, address or school.",
      },
      {
        term: "Privacy",
        definition:
          "Your right to keep information about yourself safe and to choose who sees it.",
      },
      { term: "Password", definition: "A secret word or phrase that protects your accounts." },
      { term: "Data storage", definition: "Keeping information saved on computers." },
    ],
    keyTakeaways: [
      "Personal information can identify you or show where to find you.",
      "What you type into an AI tool may be stored or seen by others.",
      "You can get great help from AI without sharing private details.",
    ],
    advantages: [
      "Keeping details private protects you and your family.",
      "Good privacy habits keep you safer everywhere online.",
      "You can still ask AI for help with ideas and explanations.",
    ],
    limitations: [
      "Once information has been shared, it is very hard to take back.",
      "You cannot see exactly how a company stores or uses your messages.",
      "AI cannot keep a secret the way a trusted person can.",
    ],
    safetyNotes: [
      "Never type your full name, address, school, phone number or passwords into an AI tool.",
      "Never upload photos of yourself or other people without a trusted adult's permission.",
      "If an AI tool or anyone online asks for personal information, stop and tell a trusted adult.",
    ],
    quiz: {
      instructions: "Five questions about keeping your information safe.",
      passingScore: 60,
      questions: [
        {
          question: "Which of these is personal information?",
          options: [
            { text: "Your favourite colour" },
            { text: "The capital of France" },
            { text: "Your home address", correct: true },
            { text: "The number of days in a week" },
          ],
          explanation: "Your address could help someone find you, so it is personal information.",
        },
        {
          question: "What can happen to messages typed into an AI tool?",
          options: [
            { text: "They may be stored and used by the company", correct: true },
            { text: "They instantly vanish for ever" },
            { text: "They turn into paper letters" },
            { text: "Nothing ever happens to them" },
          ],
          explanation:
            "Messages can be saved, reviewed or used for training, depending on the tool.",
        },
        {
          question: "Which is the safest way to ask an AI for help?",
          options: [
            { text: "“I'm Sam Lee of 4 Hill Street. Help me with maths.”" },
            { text: "“My password is tiger123. Is it a good one?”" },
            { text: "“Here is a photo of my school uniform.”" },
            { text: "“Can you explain fractions with an example?”", correct: true },
          ],
          explanation: "You can get the help you need without giving any private details.",
        },
        {
          question: "An AI chatbot asks which school you go to. What should you do?",
          options: [
            { text: "Tell it, because it is only a robot" },
            { text: "Not tell it, and let a trusted adult know", correct: true },
            { text: "Tell it your friend's school instead" },
            { text: "Give it your teacher's phone number" },
          ],
          explanation:
            "Your school is personal information. Keep it private and tell an adult that you were asked.",
        },
        {
          question: "Why is it hard to “take back” information once it is shared?",
          options: [
            { text: "Because keyboards are slow" },
            { text: "Because the internet closes at night" },
            { text: "Because copies may be stored where you cannot reach them", correct: true },
            { text: "It is easy. Just press undo" },
          ],
          explanation:
            "Once information is saved on someone else's computers, you no longer control it.",
        },
      ],
    },
  },
  {
    worldSlug: "ai-safety-school",
    slug: "can-ai-make-mistakes",
    title: "Can AI Make Mistakes?",
    description:
      "AI can be very useful and very wrong. Explore why AI makes mistakes and how to double-check its answers.",
    estimatedMinutes: 9,
    difficulty: "beginner",
    learningObjectives: [
      "Explain why AI systems make mistakes.",
      "Describe what bias means, with an example.",
      "Use simple checks before trusting an AI's answer.",
    ],
    transcript: `Calculators do not make mistakes, so surely AI does not either? Actually, AI makes mistakes all the time, and knowing why will make you a much smarter user.

Reason one: AI learns from data, and data can be wrong, out of date or incomplete. If an AI learned about animals only from pictures taken in the daytime, it might struggle to recognise an owl at night.

Reason two: AI predicts; it does not know. A chatbot produces the words that seem most likely to fit. Usually that works. Sometimes it produces something that sounds perfect but is completely made up, such as an invented fact, book or quotation. People sometimes call this a hallucination.

Reason three: bias. If the examples used in training are unfair or leave some people out, the AI can be unfair too. For instance, a voice assistant trained mostly on one accent may not understand other accents as well.

And AI rarely says “I am not sure.” It often sounds just as confident when it is wrong as when it is right.

So what do smart explorers do? They treat an AI answer as a starting point, not the final word. They check important facts in another reliable source, they ask “Does this make sense?”, and for anything that really matters, such as health or safety, they ask a trusted adult.`,
    keyTerms: [
      {
        term: "Bias",
        definition:
          "When an AI treats some people or things unfairly because of the examples it learned from.",
      },
      {
        term: "Hallucination",
        definition: "When an AI confidently gives information that is made up or wrong.",
      },
      { term: "Accuracy", definition: "How often something is correct." },
      { term: "Verify", definition: "To check that something is true." },
    ],
    keyTakeaways: [
      "AI makes mistakes because it predicts from imperfect data.",
      "AI can sound confident even when it is wrong.",
      "Check important answers with a reliable source or a trusted adult.",
    ],
    advantages: [
      "Knowing that AI can be wrong helps you use it wisely.",
      "People can find and fix AI mistakes when they check its work.",
      "Better and fairer data can make AI more accurate.",
    ],
    limitations: [
      "AI may not tell you when it is unsure.",
      "It can repeat unfairness that was hidden in its training data.",
      "It may not know about recent events.",
    ],
    safetyNotes: [
      "Never rely on AI alone for health, safety or emergency advice. Ask a trusted adult.",
      "Double-check AI answers before using them in schoolwork.",
      "If an AI says something unkind or unfair, tell a trusted adult.",
    ],
    quiz: {
      instructions: "Five questions about AI mistakes and how to catch them.",
      passingScore: 60,
      questions: [
        {
          question: "Why can AI make mistakes?",
          options: [
            { text: "Because it is being naughty" },
            { text: "Because it learns from data that can be wrong or incomplete", correct: true },
            { text: "Because it gets sleepy" },
            { text: "Because the screen is dirty" },
          ],
          explanation: "AI can only be as good as the examples it learned from.",
        },
        {
          question: "What is an AI “hallucination”?",
          options: [
            { text: "A dream that a robot has" },
            { text: "A screen saver" },
            { text: "A kind of computer virus" },
            { text: "When an AI confidently gives made-up or wrong information", correct: true },
          ],
          explanation:
            "A hallucination is an answer that sounds right but is invented or incorrect.",
        },
        {
          question:
            "A voice assistant understands some accents better than others because of its training examples. What is this an example of?",
          options: [
            { text: "Bias", correct: true },
            { text: "Magic" },
            { text: "A flat battery" },
            { text: "Good manners" },
          ],
          explanation:
            "When training examples leave some people out, the AI works less well for them. That is bias.",
        },
        {
          question: "An AI answer sounds very confident. Does that mean it is right?",
          options: [
            { text: "Yes, always" },
            { text: "Only if it uses long words" },
            { text: "No. AI can sound confident even when it is wrong", correct: true },
            { text: "Only in the morning" },
          ],
          explanation: "Confidence is not proof. AI sounds sure of itself either way.",
        },
        {
          question: "What should you do with an important fact that an AI gives you?",
          options: [
            { text: "Believe it straight away" },
            { text: "Check it with another reliable source", correct: true },
            { text: "Tell everyone at once" },
            { text: "Never use facts again" },
          ],
          explanation: "Treat an AI answer as a starting point and verify anything that matters.",
        },
      ],
    },
  },
]
