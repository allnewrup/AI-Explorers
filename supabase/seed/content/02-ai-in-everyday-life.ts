import type { SeedLesson } from "../types"

export const aiInEverydayLifeLessons: SeedLesson[] = [
  {
    worldSlug: "ai-in-everyday-life",
    slug: "how-does-youtube-recommend-videos",
    title: "How Does YouTube Recommend Videos?",
    description:
      "Why does the next video always seem to know what you like? Discover how recommendation systems make their suggestions.",
    estimatedMinutes: 8,
    difficulty: "beginner",
    learningObjectives: [
      "Explain what a recommendation system is.",
      "Describe the clues a video app uses to suggest videos.",
      "Decide for yourself when to keep watching and when to stop.",
    ],
    transcript: `You finish a video about volcanoes and, surprise, the app suggests three more about volcanoes, lava and earthquakes. That is not magic. It is a recommendation system, a type of AI used by video sites such as YouTube.

A recommendation system looks for clues about what you might enjoy. Which videos did you watch to the end? Which did you skip after five seconds? What did you search for? What did you like? It also looks at what other viewers with similar tastes watched next.

From all those clues the AI predicts which videos you are most likely to click on and keep watching, and puts them at the top.

That can be handy. You might discover a brilliant science channel you would never have found. But remember what the system is built to do: keep people watching. It does not know whether a video is true, kind or good for you, and it does not know that it is bedtime.

Recommendations can also keep showing you more of the same thing, so you see a smaller slice of the world. You are the one in charge. You can search for something new, switch off autoplay and decide when you have watched enough.`,
    keyTerms: [
      {
        term: "Recommendation system",
        definition: "An AI that suggests things you might like, such as videos, songs or products.",
      },
      { term: "Watch history", definition: "The list of videos you have watched in an app." },
      { term: "Autoplay", definition: "A setting that starts the next video automatically." },
      {
        term: "Algorithm",
        definition: "A set of steps a computer follows to work something out.",
      },
    ],
    keyTakeaways: [
      "Suggestions are predictions based on what you and similar viewers watched.",
      "The system is designed to keep you watching, not to choose what is best for you.",
      "You are in charge of what you watch and when you stop.",
    ],
    advantages: [
      "Helps you find videos about things you are interested in.",
      "Saves time searching through millions of videos.",
      "Can introduce you to new hobbies and topics.",
    ],
    limitations: [
      "Cannot tell whether a video is true or good for you.",
      "Can keep showing the same kind of content again and again.",
      "Is designed to keep you watching for longer.",
    ],
    safetyNotes: [
      "If a video upsets or worries you, stop watching and tell a trusted adult.",
      "Agree screen-time rules with a grown-up, and turn off autoplay if it makes stopping hard.",
      "Use child-friendly settings or apps that an adult has set up for you.",
    ],
    quiz: {
      instructions: "How well do you understand video suggestions? Five questions.",
      passingScore: 60,
      questions: [
        {
          question: "What does a recommendation system do?",
          options: [
            { text: "Makes your screen brighter" },
            { text: "Suggests things it predicts you will like", correct: true },
            { text: "Charges your tablet" },
            { text: "Writes the scripts for videos" },
          ],
          explanation:
            "A recommendation system predicts what you might enjoy and suggests it to you.",
        },
        {
          question: "Which clue might a video app use to choose its suggestions?",
          options: [
            { text: "Your shoe size" },
            { text: "The weather on Mars" },
            { text: "Your favourite sandwich" },
            { text: "Which videos you watched to the end", correct: true },
          ],
          explanation:
            "Watching a video all the way through is a strong clue that you enjoyed it.",
        },
        {
          question: "What is a recommendation system mainly designed to do?",
          options: [
            { text: "Keep people watching", correct: true },
            { text: "Make sure every video is true" },
            { text: "Send you to bed on time" },
            { text: "Teach you spelling" },
          ],
          explanation:
            "The system is built to keep people watching. It cannot judge whether a video is true or good for you.",
        },
        {
          question: "Why might you keep seeing the same type of video?",
          options: [
            { text: "The app has broken" },
            { text: "There are no other videos" },
            { text: "The AI predicts you like that type because you watched it before", correct: true },
            { text: "Your tablet is too old" },
          ],
          explanation:
            "The more you watch one kind of video, the more of that kind the system suggests.",
        },
        {
          question: "Who should decide when you stop watching?",
          options: [
            { text: "The autoplay button" },
            { text: "You, following the rules you agreed with a grown-up", correct: true },
            { text: "The recommendation system" },
            { text: "Whoever made the video" },
          ],
          explanation: "You are in charge, not the app. Agreed screen-time rules make stopping easier.",
        },
      ],
    },
  },
  {
    worldSlug: "ai-in-everyday-life",
    slug: "how-does-google-maps-use-ai",
    title: "How Does Google Maps Use AI?",
    description:
      "A maps app can predict a traffic jam before you reach it. Find out how AI helps plan the quickest journey.",
    estimatedMinutes: 9,
    difficulty: "beginner",
    learningObjectives: [
      "Describe how a maps app uses data to estimate traffic.",
      "Explain how AI predicts how long a journey will take.",
      "Understand why a map can sometimes be wrong.",
    ],
    transcript: `How does a maps app such as Google Maps know that the high street is jammed while you are still at home putting your shoes on?

Many phones can share their location with the maps service when people allow it. The service does not need to know who those people are. It looks at lots of phones together: if hundreds of them are crawling along one road, the traffic there must be slow, and the road is coloured red on the map.

AI adds something extra: prediction. It has learned patterns from years of journeys. It knows that a road near a school gets busy at half past three, and that the motorway is quiet on Sunday mornings. By combining what is happening right now with those patterns, it predicts what the traffic will be like when you actually get there.

Then the app compares many possible routes and suggests the one it expects to be fastest, with an estimated time of arrival.

AI also helps keep the map itself up to date by spotting road names, signs and new buildings in street and satellite photos.

Maps are helpful, but they are not perfect. A road might have closed five minutes ago, or the signal might be weak. So people still need to use their eyes, follow road signs and stay sensible.`,
    keyTerms: [
      { term: "Location data", definition: "Information about where a device is." },
      {
        term: "Estimated time of arrival (ETA)",
        definition: "A prediction of when you will reach a place.",
      },
      { term: "Route", definition: "The path you take to get somewhere." },
      { term: "Satellite image", definition: "A photo of the ground taken from space." },
    ],
    keyTakeaways: [
      "Maps apps combine live location data with patterns from past journeys.",
      "AI predicts traffic to suggest the fastest route and an arrival time.",
      "A map is a helpful guide, not a guarantee.",
    ],
    advantages: [
      "Helps people avoid traffic jams and save time.",
      "Can suggest walking, cycling and public transport routes.",
      "Updates quickly when the traffic changes.",
    ],
    limitations: [
      "Can be wrong when something has just changed, such as a new road closure.",
      "Needs a good signal and up-to-date data to work well.",
      "Does not know what you can see with your own eyes.",
    ],
    safetyNotes: [
      "Sharing your location is a choice. Ask a trusted adult before turning location sharing on in any app.",
      "Never share where you are with people you do not know.",
      "Do not look at a map while crossing a road. Stop somewhere safe first.",
    ],
    quiz: {
      instructions: "Five questions about maps, traffic and predictions.",
      passingScore: 60,
      questions: [
        {
          question: "How can a maps app tell that a road is busy?",
          options: [
            { text: "It listens for car horns" },
            { text: "A person counts cars from a helicopter all day" },
            { text: "It looks at how slowly many phones are moving along that road", correct: true },
            { text: "It guesses at random" },
          ],
          explanation:
            "When lots of phones on one road are moving slowly, the service can tell the traffic is slow.",
        },
        {
          question: "What does AI add to the live traffic information?",
          options: [
            { text: "Predictions based on patterns from past journeys", correct: true },
            { text: "Louder directions" },
            { text: "Extra petrol" },
            { text: "Faster cars" },
          ],
          explanation:
            "AI has learned patterns, such as busy school-run times, and uses them to predict traffic.",
        },
        {
          question: "What does ETA stand for?",
          options: [
            { text: "Every Tuesday Afternoon" },
            { text: "Estimated Time of Arrival", correct: true },
            { text: "Extra Traffic Ahead" },
            { text: "Easy Travel App" },
          ],
          explanation: "ETA means estimated time of arrival: a prediction of when you will get there.",
        },
        {
          question: "Why might the map sometimes be wrong?",
          options: [
            { text: "Maps are always wrong" },
            { text: "AI dislikes drivers" },
            { text: "Roads move at night" },
            { text: "A road may have just closed and the app has not found out yet", correct: true },
          ],
          explanation:
            "Maps depend on up-to-date data. Very recent changes may not have reached the app yet.",
        },
        {
          question: "What should you do before turning on location sharing in an app?",
          options: [
            { text: "Share it with everyone" },
            { text: "Post your address online" },
            { text: "Ask a trusted adult", correct: true },
            { text: "Nothing. It is always safe" },
          ],
          explanation:
            "Your location is personal information. A trusted adult can help you decide what is safe.",
        },
      ],
    },
  },
]
