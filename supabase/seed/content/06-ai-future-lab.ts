import type { SeedLesson } from "../types"

export const aiFutureLabLessons: SeedLesson[] = [
  {
    worldSlug: "ai-future-lab",
    slug: "what-are-ai-agents",
    title: "What Are AI Agents?",
    description:
      "Some AI does more than answer questions: it carries out tasks step by step. Meet AI agents and learn why people must stay in charge.",
    estimatedMinutes: 10,
    difficulty: "intermediate",
    learningObjectives: [
      "Explain how an AI agent differs from a chatbot.",
      "Describe the steps an agent follows to complete a task.",
      "Explain why humans need to supervise AI agents.",
    ],
    transcript: `Most AI you have met so far answers questions: you ask, it replies. An AI agent goes a step further. You give it a goal, and it works out the steps and carries them out.

Imagine asking, “Plan a picnic for Saturday.” A chatbot might write a nice list. An agent could check the weather forecast, look at the family calendar, find a park nearby, write a shopping list and set a reminder, using different tools along the way, a bit like a helpful assistant.

To do this, an agent repeats a loop. First it plans: what needs doing? Then it acts, using a tool such as a search engine or a calendar. Then it checks: did that work? If not, it tries another way. It keeps going until the goal is reached or it needs to ask for help.

Agents could save people lots of time on boring jobs. But because agents take actions, mistakes matter more. A chatbot's wrong answer is just words. An agent's wrong action might send the wrong message or buy the wrong thing.

That is why good agents are built with limits. They only get the permissions they really need, and they ask a human before doing anything important. People choose the goals, set the rules and check the results. The human stays in charge.`,
    keyTerms: [
      {
        term: "AI agent",
        definition:
          "An AI system that can plan and carry out steps to reach a goal, often using other tools.",
      },
      { term: "Goal", definition: "The result you want to achieve." },
      {
        term: "Tool",
        definition: "A program an agent can use, such as a search engine, calendar or calculator.",
      },
      {
        term: "Supervise",
        definition: "To watch over something and step in when needed.",
      },
    ],
    keyTakeaways: [
      "An AI agent plans and takes actions to reach a goal.",
      "Agents work in a loop: plan, act, check.",
      "People must set the rules and stay in charge.",
    ],
    advantages: [
      "Can complete tasks with several steps and save people time.",
      "Can use several tools together.",
      "Can take over repetitive jobs so that people can focus on other things.",
    ],
    limitations: [
      "A mistake in one step can cause problems in later steps.",
      "May misunderstand what a person really wanted.",
      "Needs careful limits and human checking.",
    ],
    safetyNotes: [
      "Never give an AI agent passwords, payment details or permission to act for you. That is for adults to decide.",
      "Important actions, such as spending money or sending messages, should always be approved by a person.",
      "If an AI tool starts doing something you did not expect, stop and tell a trusted adult.",
    ],
    quiz: {
      instructions: "Five questions about AI that takes action.",
      passingScore: 60,
      questions: [
        {
          question: "What is the main difference between a chatbot and an AI agent?",
          options: [
            { text: "An agent is always a robot with legs" },
            { text: "A chatbot is more expensive" },
            { text: "An agent can plan and carry out steps to reach a goal", correct: true },
            { text: "There is no difference" },
          ],
          explanation:
            "A chatbot replies with words. An agent works out the steps and takes actions.",
        },
        {
          question: "Which loop does an AI agent follow?",
          options: [
            { text: "Plan, act, check", correct: true },
            { text: "Eat, sleep, repeat" },
            { text: "Stop, drop, roll" },
            { text: "Copy, paste, print" },
          ],
          explanation:
            "An agent plans a step, carries it out, checks the result and then repeats.",
        },
        {
          question: "Why do mistakes matter more with agents than with chatbots?",
          options: [
            { text: "Because agents are louder" },
            { text: "Because chatbots never make mistakes" },
            { text: "Because agents use more colours" },
            { text: "Because agents take actions, not just write words", correct: true },
          ],
          explanation:
            "A wrong action, such as sending a message, has real effects. A wrong sentence can simply be ignored.",
        },
        {
          question:
            "What should a well-designed agent do before something important, such as spending money?",
          options: [
            { text: "Do it quickly" },
            { text: "Ask a human for approval", correct: true },
            { text: "Hide it" },
            { text: "Do it twice to be sure" },
          ],
          explanation: "Important actions should be approved by a person first.",
        },
        {
          question: "Who should stay in charge when an AI agent is working?",
          options: [
            { text: "The agent" },
            { text: "Nobody" },
            { text: "People", correct: true },
            { text: "The fastest computer" },
          ],
          explanation: "People set the goals and the rules, and they check the results.",
        },
      ],
    },
  },
  {
    worldSlug: "ai-future-lab",
    slug: "how-do-robots-use-ai",
    title: "How Do Robots Use AI?",
    description:
      "Robots sense, think and act. Find out how AI helps robots understand the world around them.",
    estimatedMinutes: 9,
    difficulty: "beginner",
    learningObjectives: [
      "Explain the difference between a robot and AI.",
      "Describe the sense, think, act cycle.",
      "Give examples of jobs robots do and of their limits.",
    ],
    transcript: `People often mix up robots and AI, but they are not the same thing. A robot is a machine with a body that can move and do things in the real world. AI is software, which means a kind of computer program. Some robots use AI as their “brain” and some do not: a simple robot arm in a factory may just repeat the same movement all day.

A robot that uses AI works in a cycle with three parts: sense, think, act.

Sense. The robot collects information using sensors. Cameras work a bit like eyes, microphones a bit like ears, and touch sensors tell it when it has bumped into something.

Think. This is where AI comes in. It looks for patterns in the sensor data: that shape is a chair, that sound is a spoken command, that gap is wide enough to drive through. Then it decides what to do.

Act. Motors move wheels, arms or grippers to carry out the decision. Then the cycle starts again, many times every second.

A robot vacuum cleaner is a good example. It senses walls and furniture, builds a map of the room and plans a path to clean the floor.

Robots are helpful in places that are dull, dirty or dangerous for people: warehouses, deep oceans, even Mars. But the real world is messy, and things that are easy for you, such as tidying a bedroom or folding a jumper, are still very hard for robots.`,
    keyTerms: [
      {
        term: "Robot",
        definition:
          "A machine that can sense its surroundings and move or do tasks in the real world.",
      },
      {
        term: "Sensor",
        definition: "A part that collects information, like a camera, microphone or touch sensor.",
      },
      { term: "Motor", definition: "A part that makes a robot move." },
      {
        term: "Software",
        definition: "The programs that tell a computer or robot what to do.",
      },
    ],
    keyTakeaways: [
      "A robot is a machine with a body; AI is software that can act as its brain.",
      "AI robots repeat a cycle: sense, think, act.",
      "Robots are useful but still struggle with many everyday tasks.",
    ],
    advantages: [
      "Can work in places that are dangerous for people.",
      "Can do repetitive jobs accurately for a long time.",
      "Can help explore places humans cannot easily reach, like other planets.",
    ],
    limitations: [
      "Struggle with messy, unexpected situations.",
      "Find many everyday tasks, like folding clothes, very difficult.",
      "Can only sense what their sensors are able to detect.",
    ],
    safetyNotes: [
      "Keep fingers, hair and loose clothing away from moving robot parts.",
      "Robots and smart toys may have cameras and microphones. Ask a trusted adult about privacy settings.",
      "Follow the instructions and use robots only in the way they were designed to be used.",
    ],
    quiz: {
      instructions: "Five questions about robots and their AI brains.",
      passingScore: 60,
      questions: [
        {
          question: "What is the difference between a robot and AI?",
          options: [
            { text: "They are exactly the same" },
            {
              text: "A robot is a machine with a body; AI is software that can act as its brain",
              correct: true,
            },
            { text: "AI is made of metal" },
            { text: "Robots are always alive" },
          ],
          explanation:
            "A robot is hardware that moves in the real world. AI is software that can help it decide what to do.",
        },
        {
          question: "What are the three parts of the cycle an AI robot follows?",
          options: [
            { text: "Run, jump, hide" },
            { text: "Read, write, draw" },
            { text: "Start, stop, sleep" },
            { text: "Sense, think, act", correct: true },
          ],
          explanation: "The robot senses its surroundings, thinks about what to do, and then acts.",
        },
        {
          question: "Which part of a robot collects information about its surroundings?",
          options: [
            { text: "Sensors", correct: true },
            { text: "Paint" },
            { text: "The wheels only" },
            { text: "The on/off sticker" },
          ],
          explanation: "Sensors such as cameras and microphones gather information for the robot.",
        },
        {
          question: "Why are robots useful on Mars or in the deep ocean?",
          options: [
            { text: "They enjoy holidays" },
            { text: "They need a bath" },
            { text: "Those places are dangerous or hard for people to reach", correct: true },
            { text: "Robots get bored at home" },
          ],
          explanation: "Robots can go where it would be unsafe or impossible to send people.",
        },
        {
          question: "Which task is still very hard for most robots?",
          options: [
            { text: "Repeating one movement in a factory" },
            { text: "Adding up numbers" },
            { text: "Following a painted line on the floor" },
            { text: "Folding a pile of mixed laundry neatly", correct: true },
          ],
          explanation:
            "Soft, messy, unpredictable objects are much harder for robots than for people.",
        },
      ],
    },
  },
]
