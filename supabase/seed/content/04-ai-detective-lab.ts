import type { SeedLesson } from "../types"

export const aiDetectiveLabLessons: SeedLesson[] = [
  {
    worldSlug: "ai-detective-lab",
    slug: "what-is-a-deepfake",
    title: "What Is a Deepfake?",
    description:
      "Some videos show people saying things they never said. Learn what deepfakes are, how they are made and how to stay calm and careful.",
    estimatedMinutes: 9,
    difficulty: "intermediate",
    learningObjectives: [
      "Explain what a deepfake is.",
      "Describe why deepfakes can be harmful.",
      "List the steps to take when a video or voice clip seems suspicious.",
    ],
    transcript: `Imagine a video in which a famous footballer announces that homework is banned for ever. It looks like them. It sounds like them. But they never said it. A video like that is called a deepfake.

A deepfake is a video, picture or sound recording that has been made or changed using AI so that a person appears to do or say something they never did. The AI studies many real photos or recordings of someone's face or voice, learns the patterns, and then creates a convincing copy.

Not every use of this technology is bad. Film-makers use similar tools for special effects, with the actors' permission. The problem comes when deepfakes are used to trick people, spread lies, cheat people out of money or embarrass someone.

Deepfakes can be hard to spot. Sometimes the blinking looks odd, the lips do not quite match the words, or the voice sounds flat. But you cannot rely on clues alone, because the fakes keep getting better.

So detectives use questions instead. Who posted this? Is a trustworthy news source reporting the same thing? Does it seem designed to shock me or make me angry? If something feels off, pause. Do not share it. Ask a trusted adult to help you check.`,
    keyTerms: [
      {
        term: "Deepfake",
        definition:
          "A video, picture or sound recording made or changed with AI so that someone appears to say or do something they never did.",
      },
      { term: "Misinformation", definition: "False or misleading information." },
      { term: "Source", definition: "Where a piece of information comes from." },
      {
        term: "Permission",
        definition: "Agreement from a person before you do something that involves them.",
      },
    ],
    keyTakeaways: [
      "A deepfake makes someone appear to say or do something they never did.",
      "You cannot always spot a deepfake just by looking.",
      "Pause, do not share, and check with a trusted adult.",
    ],
    advantages: [
      "The same technology can create film special effects when actors agree to it.",
      "It can help translate videos so that lips match a new language.",
      "Learning about it helps everyone become harder to trick.",
    ],
    limitations: [
      "Detection tools and visual clues do not always work.",
      "Fakes are improving, so yesterday's tips may not work tomorrow.",
      "A fake can spread widely before anyone corrects it.",
    ],
    safetyNotes: [
      "Never create or share a fake video, picture or voice clip of a real person. It can seriously hurt them.",
      "If you see a deepfake of yourself or someone you know, tell a trusted adult straight away. It is not your fault.",
      "If a message or call sounds like someone you know but asks for money, passwords or secrets, stop and check with an adult.",
    ],
    quiz: {
      instructions: "Put on your detective hat. Five questions about deepfakes.",
      passingScore: 60,
      questions: [
        {
          question: "What is a deepfake?",
          options: [
            { text: "A very deep swimming pool" },
            { text: "A photo taken underwater" },
            {
              text: "A video, picture or sound made with AI so someone seems to do or say something they never did",
              correct: true,
            },
            { text: "A broken video file" },
          ],
          explanation:
            "A deepfake uses AI to copy a person's face or voice and make them appear to do something they did not.",
        },
        {
          question: "Why can deepfakes be harmful?",
          options: [
            { text: "They can be used to trick people and spread lies", correct: true },
            { text: "They use too much electricity" },
            { text: "They are always too quiet" },
            { text: "They make screens crack" },
          ],
          explanation:
            "Deepfakes can make people believe things that are not true and can hurt the person who was copied.",
        },
        {
          question: "Can you always tell a deepfake just by looking carefully?",
          options: [
            { text: "Yes, always" },
            { text: "Only on Tuesdays" },
            { text: "Only if it is in black and white" },
            { text: "No. Some are very convincing, so you need to check the source too", correct: true },
          ],
          explanation:
            "Clues like odd blinking can help, but fakes keep improving. Checking the source matters more.",
        },
        {
          question: "You see a shocking video of a celebrity. What is the best first step?",
          options: [
            { text: "Share it with everyone immediately" },
            { text: "Pause and check whether trustworthy sources report the same thing", correct: true },
            { text: "Believe it because it looks real" },
            { text: "Make your own version" },
          ],
          explanation: "Shocking clips are exactly the ones to check before believing or sharing.",
        },
        {
          question: "Someone makes a fake video of a classmate as a “joke”. What should you do?",
          options: [
            { text: "Share it so others can laugh" },
            { text: "Make another one" },
            { text: "Do not share it, and tell a trusted adult", correct: true },
            { text: "Keep it secret for ever" },
          ],
          explanation:
            "Fake videos of real people can really hurt them. Not sharing and telling an adult protects your classmate.",
        },
      ],
    },
  },
  {
    worldSlug: "ai-detective-lab",
    slug: "how-to-check-online-information",
    title: "How Can We Check Whether Online Information Is Genuine?",
    description:
      "Become a fact detective. Learn simple checks that help you decide whether something online can be trusted.",
    estimatedMinutes: 10,
    difficulty: "intermediate",
    learningObjectives: [
      "Use three questions to check online information.",
      "Explain why checking more than one source matters.",
      "Recognise warning signs that something may be false.",
    ],
    transcript: `The internet is like the biggest library in the world, except that anybody can put a book on the shelf. Some of it is carefully checked. Some is a mistake. Some is made up on purpose. And now AI tools can produce realistic text, pictures and videos in seconds. So how do you know what is genuine?

Good detectives ask questions. Here are three.

One: who made this? Look for the author or the organisation. Is it a known news service, a museum, a school or a scientist? Or is it an account you have never heard of?

Two: can I find it somewhere else? Real news is usually reported by several trustworthy sources. If only one strange website says that chocolate cures colds, be suspicious.

Three: how does it make me feel? False stories are often designed to make you shocked, scared or angry, because strong feelings make people share without thinking.

There are other clues too. Check the date, because old news is sometimes shared as if it were new. Look closely at pictures. And remember that AI chatbots can make mistakes or invent things, so their answers need checking as well.

You do not have to do this alone. When you are unsure, pause before sharing and ask a parent, carer, teacher or librarian.`,
    keyTerms: [
      { term: "Source", definition: "Where a piece of information comes from." },
      {
        term: "Fact-check",
        definition: "To check whether a claim is true by using reliable sources.",
      },
      {
        term: "Reliable",
        definition: "Something you can trust because it has been right before and can be checked.",
      },
      { term: "Evidence", definition: "Facts or proof that show whether something is true." },
    ],
    keyTakeaways: [
      "Ask: who made this, can I find it elsewhere, and how does it make me feel?",
      "Check more than one trustworthy source before you believe or share.",
      "Pause and ask an adult when you are not sure.",
    ],
    advantages: [
      "Checking sources helps you avoid being tricked.",
      "You become a person others can trust for good information.",
      "AI search tools can help you find sources quickly, as long as you then check them.",
    ],
    limitations: [
      "Even trusted sources sometimes make mistakes.",
      "AI tools can invent facts or sources that do not exist.",
      "Fakes are becoming more realistic, so checking takes care and time.",
    ],
    safetyNotes: [
      "Do not click links or download files from messages you were not expecting.",
      "Never share something just because it is shocking. Pause first.",
      "If something online frightens or confuses you, tell a trusted adult.",
    ],
    quiz: {
      instructions: "Five questions to earn your fact-detective badge.",
      passingScore: 60,
      questions: [
        {
          question: "Which question helps you check whether information is genuine?",
          options: [
            { text: "Is it written in capital letters?" },
            { text: "Does it have lots of emojis?" },
            { text: "Is it long?" },
            { text: "Who made this, and can they be trusted?", correct: true },
          ],
          explanation: "Knowing who made something is the first step in deciding whether to trust it.",
        },
        {
          question: "Only one unknown website reports an amazing story. What should you think?",
          options: [
            { text: "It must be true" },
            { text: "Be suspicious and look for other trustworthy sources", correct: true },
            { text: "Share it quickly before it disappears" },
            { text: "It is secret news" },
          ],
          explanation: "Real news is usually reported by several trustworthy sources, not just one.",
        },
        {
          question: "Why are false stories often shocking or scary?",
          options: [
            { text: "Because strong feelings make people share without thinking", correct: true },
            { text: "Because true stories are always boring" },
            { text: "Because computers like drama" },
            { text: "It happens by accident" },
          ],
          explanation:
            "Stories designed to shock spread quickly, because people share them before checking.",
        },
        {
          question: "An AI chatbot gives you a fact for your project. What should you do?",
          options: [
            { text: "Use it without checking, because AI is always right" },
            { text: "Change it to sound better" },
            { text: "Check it with a reliable source", correct: true },
            { text: "Ask the chatbot to promise it is true" },
          ],
          explanation: "Chatbots can make mistakes or invent things, so their answers need checking too.",
        },
        {
          question: "You are not sure whether a post is true. What is the best thing to do?",
          options: [
            { text: "Share it and see what happens" },
            { text: "Argue in the comments" },
            { text: "Send a screenshot to everyone" },
            { text: "Pause, do not share, and ask a trusted adult", correct: true },
          ],
          explanation: "Pausing stops false information spreading, and an adult can help you check.",
        },
      ],
    },
  },
]
