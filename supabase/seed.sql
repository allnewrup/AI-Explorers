-- =============================================================================
-- AI Explorers — seed data
-- -----------------------------------------------------------------------------
-- GENERATED FILE. Do not edit by hand.
--   Source:      supabase/seed/content/*.ts and src/config/worlds.ts
--   Regenerate:  npm run seed:generate
--
-- Contains six learning worlds, twelve original SAMPLE lessons (each with a
-- five-question quiz) and six achievements. No accounts, no children and no
-- personal data are created.
--
-- Lessons are seeded as published sample content (is_sample = true) and have
-- no video (video_asset_key is NULL): the app shows a "video coming soon"
-- state rather than a placeholder player.
--
-- Safe to run more than once: rows that already exist are left untouched, so
-- edits made later in the admin CMS are never overwritten.
-- =============================================================================

-- Learning worlds
insert into public.learning_worlds (id, title, slug, description, image_key, age_band, display_order, is_active)
values ('f6b9b316-b67b-51c0-86cd-b608494a40e5', 'AI Beginners', 'ai-beginners', 'Start here! Find out what artificial intelligence really is and how machines learn from examples.', 'world-beginners', '8-12', 1, true)
on conflict (id) do nothing;
insert into public.learning_worlds (id, title, slug, description, image_key, age_band, display_order, is_active)
values ('afc53426-1801-5fa5-bbda-21d664e3e8c1', 'AI in Everyday Life', 'ai-in-everyday-life', 'Spot the AI hiding in plain sight, from video suggestions to the maps that guide a car journey.', 'world-everyday', '8-12', 2, true)
on conflict (id) do nothing;
insert into public.learning_worlds (id, title, slug, description, image_key, age_band, display_order, is_active)
values ('112f6f5f-f368-524a-9106-39573bb8680f', 'AI Creativity Studio', 'ai-creativity-studio', 'See how AI can help make pictures and stories, and why your own ideas still matter most.', 'world-creativity', '8-12', 3, true)
on conflict (id) do nothing;
insert into public.learning_worlds (id, title, slug, description, image_key, age_band, display_order, is_active)
values ('f52a06f0-8a87-5989-be94-4b08f6a58eb8', 'AI Detective Lab', 'ai-detective-lab', 'Become a fact detective. Learn to question what you see online and check whether it is genuine.', 'world-detective', '8-12', 4, true)
on conflict (id) do nothing;
insert into public.learning_worlds (id, title, slug, description, image_key, age_band, display_order, is_active)
values ('f2152ad4-c5e0-5e29-b37d-a6bde94fd81f', 'AI Safety School', 'ai-safety-school', 'Learn the golden rules for using AI safely: protect your information and double-check answers.', 'world-safety', '8-12', 5, true)
on conflict (id) do nothing;
insert into public.learning_worlds (id, title, slug, description, image_key, age_band, display_order, is_active)
values ('3b81b795-73cc-532a-a63b-d6770b08ad34', 'AI Future Lab', 'ai-future-lab', 'Peek at what comes next: AI helpers that carry out tasks and robots that sense the world.', 'world-future', '8-12', 6, true)
on conflict (id) do nothing;

-- Lesson: What Is Artificial Intelligence?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  'd14fa48a-37c6-5057-9fea-889e516c5be8',
  'f6b9b316-b67b-51c0-86cd-b608494a40e5',
  'What Is Artificial Intelligence?',
  'what-is-artificial-intelligence',
  'Meet artificial intelligence: computer programs that learn from examples to do jobs that usually need human thinking.',
  '8-12',
  'beginner',
  8,
  1,
  array['Explain in your own words what artificial intelligence (AI) is.', 'Describe how AI learns from examples called data.', 'Name two things AI can do and one thing it cannot.']::text[],
  'Artificial intelligence, or AI for short, is a kind of computer program that can do jobs we normally think need human brainpower, like recognising a face in a photo, understanding spoken words or suggesting the next song.

Ordinary programs follow exact step-by-step instructions written by a person. AI is different. Instead of being told every step, it is shown lots and lots of examples and finds patterns in them. Those examples are called data, and the practice is called training.

Imagine teaching a friend to spot ripe bananas. You would not write a rule book. You would show them many bananas: green ones, yellow ones and spotty brown ones. After a while they just get it. AI learns in a similar way, except it might look at millions of pictures.

AI is clever at the one job it has been trained for, but it does not understand the world the way you do. It has no feelings, no wishes and no common sense. It is a tool made by people, and a very useful one when we use it carefully.',
  '[{"term":"Artificial intelligence (AI)","definition":"Computer programs that can do tasks which usually need human thinking, such as recognising pictures or understanding speech."},{"term":"Data","definition":"Information, such as pictures, words or numbers, that an AI learns from."},{"term":"Training","definition":"Showing an AI many examples so that it can find patterns."},{"term":"Pattern","definition":"Something that repeats in a way you can spot and use to make a good guess."}]'::jsonb,
  array['AI is a computer program, not a living thing.', 'AI learns by finding patterns in lots of examples.', 'AI is a tool made and guided by people.']::text[],
  array['Can sort through huge amounts of information very quickly.', 'Does not get tired or bored doing the same job again and again.', 'Can help people with tasks such as translating languages or spotting patterns in the weather.']::text[],
  array['Only knows what was in the examples it learned from.', 'Has no feelings, common sense or real understanding.', 'Can be confidently wrong, especially about things it was never trained on.']::text[],
  array['Remember that an AI is a tool, not a person or a friend who knows you.', 'If an AI tells you something important, check it with a trusted adult or another source.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('f67d3ece-e5f4-5d48-8e2a-03929920e339', 'd14fa48a-37c6-5057-9fea-889e516c5be8', 'Quiz: What Is Artificial Intelligence?', 'Five quick questions about what AI is and how it learns. Take your time!', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('f385921f-c61b-533b-afe7-07768bc59f0a', 'f67d3ece-e5f4-5d48-8e2a-03929920e339', 'What is artificial intelligence?', 'beginner', 'AI is a kind of computer program. It can do some tasks that normally need human thinking, but it is not alive.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('c8ac9923-b0be-50af-8820-adb04c113e30', 'f385921f-c61b-533b-afe7-07768bc59f0a', 'A robot that is alive', false, 1),
  ('d8819ebf-6bdc-5571-9344-cd31dda39d81', 'f385921f-c61b-533b-afe7-07768bc59f0a', 'A computer program that can do tasks that usually need human thinking', true, 2),
  ('2e7662bf-2333-509e-a832-d0e4e3a1f027', 'f385921f-c61b-533b-afe7-07768bc59f0a', 'A very fast internet connection', false, 3),
  ('23643617-652f-54b2-b2e5-ea6925c9769a', 'f385921f-c61b-533b-afe7-07768bc59f0a', 'A type of games console', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('68213830-cc25-5fde-b149-cbcf8e8089e0', 'f67d3ece-e5f4-5d48-8e2a-03929920e339', 'How does an AI usually learn to do its job?', 'beginner', 'An AI is trained on many examples and finds the patterns in them.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('3c00ae0b-edc8-5cc8-8e51-4b2f238908a7', '68213830-cc25-5fde-b149-cbcf8e8089e0', 'By finding patterns in lots of examples', true, 1),
  ('0f6a5802-16d3-53b7-a3bd-4600f3b1836f', '68213830-cc25-5fde-b149-cbcf8e8089e0', 'By going to school with children', false, 2),
  ('22aadca2-363f-5ebb-8e49-f65ddc304c87', '68213830-cc25-5fde-b149-cbcf8e8089e0', 'By reading people''s minds', false, 3),
  ('9785577c-1eec-557f-976c-eeb41469a760', '68213830-cc25-5fde-b149-cbcf8e8089e0', 'By guessing at random for ever', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('2a16c5ce-aada-55e1-80e3-91b93aaead44', 'f67d3ece-e5f4-5d48-8e2a-03929920e339', 'What do we call the examples an AI learns from?', 'beginner', 'The pictures, words and numbers an AI learns from are called data.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('cf4379c3-66f3-5138-9412-6693b458e0f1', '2a16c5ce-aada-55e1-80e3-91b93aaead44', 'Batteries', false, 1),
  ('a869bf23-4020-5a3b-b950-0866fb49b797', '2a16c5ce-aada-55e1-80e3-91b93aaead44', 'Wires', false, 2),
  ('3313825d-9f4a-5aaf-8225-0cd430e685a0', '2a16c5ce-aada-55e1-80e3-91b93aaead44', 'Data', true, 3),
  ('4d8c74cf-cd24-5e61-b0a9-69e3bb45aad9', '2a16c5ce-aada-55e1-80e3-91b93aaead44', 'Passwords', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('14eb2c75-1494-5fa5-a716-1866b803d229', 'f67d3ece-e5f4-5d48-8e2a-03929920e339', 'Which of these is true about AI?', 'beginner', 'AI is a tool that people build and guide. It has no feelings and it can be wrong.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('dd489090-522d-5d3c-9541-7614d280dcc3', '14eb2c75-1494-5fa5-a716-1866b803d229', 'It has feelings just like you', false, 1),
  ('d6905cec-157f-56dd-a525-5febbb7b113a', '14eb2c75-1494-5fa5-a716-1866b803d229', 'It always tells the truth', false, 2),
  ('e6b24c25-0b76-5e34-8543-1716e9e70783', '14eb2c75-1494-5fa5-a716-1866b803d229', 'It understands everything in the world', false, 3),
  ('042ffed7-382a-581f-b454-63c117d9b433', '14eb2c75-1494-5fa5-a716-1866b803d229', 'It is a tool made by people', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('ea342962-5e65-5a57-b014-1b4eab0558df', 'f67d3ece-e5f4-5d48-8e2a-03929920e339', 'An AI was trained only on pictures of cats and dogs. What might happen if you show it a giraffe?', 'beginner', 'An AI only knows what it was trained on. Shown something new, it may still guess, and guess wrong.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('0bda279a-0057-555b-894f-d64ad09acb21', 'ea342962-5e65-5a57-b014-1b4eab0558df', 'It will certainly say “giraffe”', false, 1),
  ('6990e8a7-fb62-50f9-8595-0826da8c6fbf', 'ea342962-5e65-5a57-b014-1b4eab0558df', 'It may give a wrong answer because it never learned about giraffes', true, 2),
  ('7d601324-e6ca-55bf-a5d8-9a812895829b', 'ea342962-5e65-5a57-b014-1b4eab0558df', 'It will switch itself off', false, 3),
  ('e4516ddf-ac59-5ca0-ab3a-488fd03181f4', 'ea342962-5e65-5a57-b014-1b4eab0558df', 'It will ask a teacher', false, 4)
on conflict (id) do nothing;

-- Lesson: Can Machines Think Like Humans?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  'edd04b7a-c338-55b6-b322-37d80f09eeb4',
  'f6b9b316-b67b-51c0-86cd-b608494a40e5',
  'Can Machines Think Like Humans?',
  'can-machines-think-like-humans',
  'Computers can be brilliant at some puzzles, but is that the same as thinking? Compare how machines and people work things out.',
  '8-12',
  'beginner',
  9,
  2,
  array['Compare how people think with how AI works.', 'Explain why sounding clever is not the same as understanding.', 'Give examples of things humans are better at than AI.']::text[],
  'A computer can beat a chess champion and add up a million numbers in a blink. So can machines think like we do? Not really, and the difference is interesting.

When you think, you use much more than facts. You use your senses, your memories, your feelings and your common sense. You know that ice cream melts in the sun and that a friend who is crying might need a hug. Nobody had to show you a million examples.

An AI works by spotting patterns in data and using them to predict a good answer. A chatbot, for example, predicts which words are likely to come next. Its sentences can sound friendly and wise, but it does not actually know what a hug feels like. It has never been cold, hungry or happy.

That is why people say AI imitates thinking. It is a little like a parrot that can say “hello” perfectly without knowing what a greeting is, although this parrot has studied a huge library.

Humans and machines are good at different things. Machines are fast and tireless. People are curious, kind and creative, and can understand why something matters. The best results come when people stay in charge and use AI as a helper.',
  '[{"term":"Prediction","definition":"A careful guess about what comes next, based on patterns."},{"term":"Common sense","definition":"Everyday knowledge about how the world works, which people pick up simply by living in it."},{"term":"Imitate","definition":"To copy how something looks or sounds."},{"term":"Chatbot","definition":"An AI program you can type or talk to, which replies in sentences."}]'::jsonb,
  array['AI predicts answers from patterns; it does not understand like a person.', 'Sounding confident is not the same as being right.', 'People bring feelings, common sense and judgement that machines do not have.']::text[],
  array['Machines can calculate and search far faster than people.', 'AI can practise a task millions of times without getting tired.', 'AI can free people to spend more time on creative and caring work.']::text[],
  array['AI has no feelings, experiences or common sense.', 'AI cannot truly understand why something is right or wrong.', 'AI can sound very sure even when its answer is mistaken.']::text[],
  array['A chatbot may sound like a friend, but it is a program. Talk to real people you trust about your feelings and worries.', 'Do not let an AI make important decisions for you. Ask a trusted adult.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('26ce3c98-d4d4-5aa6-88c1-1ae10ad309fc', 'edd04b7a-c338-55b6-b322-37d80f09eeb4', 'Quiz: Can Machines Think Like Humans?', 'Can you tell the difference between thinking and predicting? Five questions.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('924d98e2-487d-53bf-8a4f-9da4497ce99c', '26ce3c98-d4d4-5aa6-88c1-1ae10ad309fc', 'How does a chatbot decide what to write?', 'beginner', 'A chatbot has learned patterns in language and predicts the words most likely to fit.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('8fb11fa7-f77b-53ad-8c20-4e9473f06946', '924d98e2-487d-53bf-8a4f-9da4497ce99c', 'It asks another person secretly', false, 1),
  ('c168dbc8-fdc9-5e9d-87b1-9b435cf8155d', '924d98e2-487d-53bf-8a4f-9da4497ce99c', 'It remembers its own childhood', false, 2),
  ('2c9205dc-977e-57f5-a03a-7a93a01e39a0', '924d98e2-487d-53bf-8a4f-9da4497ce99c', 'It predicts which words are likely to come next', true, 3),
  ('d74d41f6-ffa2-5dbc-b73a-31ef89105c0d', '924d98e2-487d-53bf-8a4f-9da4497ce99c', 'It reads your mind', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('6cc25032-c22c-5ae8-86e2-2af0b82d547e', '26ce3c98-d4d4-5aa6-88c1-1ae10ad309fc', 'Which of these can a human do that an AI cannot?', 'beginner', 'AI can describe feelings using words, but it does not have any.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('ece1c6ab-9fa6-567a-827e-b63a796dedfe', '6cc25032-c22c-5ae8-86e2-2af0b82d547e', 'Add up numbers', false, 1),
  ('fc7ac55c-ff4e-54ec-b52d-ac1f96578b62', '6cc25032-c22c-5ae8-86e2-2af0b82d547e', 'Actually feel happy or sad', true, 2),
  ('2fba3ac0-3797-5c05-a661-9cce91e1db73', '6cc25032-c22c-5ae8-86e2-2af0b82d547e', 'Sort a list of names', false, 3),
  ('fd54ad6d-0874-564e-9c68-b853a498d825', '6cc25032-c22c-5ae8-86e2-2af0b82d547e', 'Store lots of facts', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('874a6c95-e0a7-5be8-b769-f3f673a3775a', '26ce3c98-d4d4-5aa6-88c1-1ae10ad309fc', 'An AI gives an answer that sounds very confident. What does that tell you?', 'beginner', 'AI often sounds just as sure when it is wrong as when it is right.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('5e8b1a28-dfc4-594a-9c08-a030ce7eb425', '874a6c95-e0a7-5be8-b769-f3f673a3775a', 'The answer must be correct', false, 1),
  ('d21fb5f4-8211-5548-8043-7bdc5e753a81', '874a6c95-e0a7-5be8-b769-f3f673a3775a', 'The AI is alive', false, 2),
  ('76f77db2-3ed7-578b-bf35-c68b67d07427', '874a6c95-e0a7-5be8-b769-f3f673a3775a', 'The AI is angry', false, 3),
  ('779365bc-e785-5fd9-b650-b829e3aa2531', '874a6c95-e0a7-5be8-b769-f3f673a3775a', 'Nothing for certain. It could still be wrong', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('afa9794c-4c22-58ea-b1ab-3e5dc2c34315', '26ce3c98-d4d4-5aa6-88c1-1ae10ad309fc', 'Why do people say that AI “imitates” thinking?', 'beginner', 'AI produces language that looks like thinking by following patterns, not by understanding.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('0732f673-ef89-54f7-935c-b245fe8e87aa', 'afa9794c-4c22-58ea-b1ab-3e5dc2c34315', 'Because it copies patterns of human language without truly understanding them', true, 1),
  ('bc202b9c-1912-52f4-8783-9a16f71cac36', 'afa9794c-4c22-58ea-b1ab-3e5dc2c34315', 'Because it has a brain made of jelly', false, 2),
  ('be280836-eb10-5ccc-984a-44dd59b1e196', 'afa9794c-4c22-58ea-b1ab-3e5dc2c34315', 'Because it copies homework', false, 3),
  ('2e0e6506-7200-5b47-a4ab-f4b062f48254', 'afa9794c-4c22-58ea-b1ab-3e5dc2c34315', 'Because it only works at night', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('6a6f3da6-921d-53d5-a25b-be5b6d9e2148', '26ce3c98-d4d4-5aa6-88c1-1ae10ad309fc', 'What is the best way for people and AI to work together?', 'beginner', 'AI is most useful as a helper. People should set the goals and make the decisions.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('1299b408-7e74-5412-a587-ef109558b6b5', '6a6f3da6-921d-53d5-a25b-be5b6d9e2148', 'Let the AI decide everything', false, 1),
  ('4b1bf5a6-87f7-5a11-be0c-7cb9874fc4c8', '6a6f3da6-921d-53d5-a25b-be5b6d9e2148', 'Never use AI at all', false, 2),
  ('c9a7706a-3f35-5561-8d37-62532284630a', '6a6f3da6-921d-53d5-a25b-be5b6d9e2148', 'People stay in charge and use AI as a helper', true, 3),
  ('61b6fba0-7d8c-5e5e-a90b-6e435e334c51', '6a6f3da6-921d-53d5-a25b-be5b6d9e2148', 'Do whatever the AI says as fast as possible', false, 4)
on conflict (id) do nothing;

-- Lesson: How Does YouTube Recommend Videos?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  'f521a56e-e7f0-5ac2-a08d-b65ed3e4d019',
  'afc53426-1801-5fa5-bbda-21d664e3e8c1',
  'How Does YouTube Recommend Videos?',
  'how-does-youtube-recommend-videos',
  'Why does the next video always seem to know what you like? Discover how recommendation systems make their suggestions.',
  '8-12',
  'beginner',
  8,
  1,
  array['Explain what a recommendation system is.', 'Describe the clues a video app uses to suggest videos.', 'Decide for yourself when to keep watching and when to stop.']::text[],
  'You finish a video about volcanoes and, surprise, the app suggests three more about volcanoes, lava and earthquakes. That is not magic. It is a recommendation system, a type of AI used by video sites such as YouTube.

A recommendation system looks for clues about what you might enjoy. Which videos did you watch to the end? Which did you skip after five seconds? What did you search for? What did you like? It also looks at what other viewers with similar tastes watched next.

From all those clues the AI predicts which videos you are most likely to click on and keep watching, and puts them at the top.

That can be handy. You might discover a brilliant science channel you would never have found. But remember what the system is built to do: keep people watching. It does not know whether a video is true, kind or good for you, and it does not know that it is bedtime.

Recommendations can also keep showing you more of the same thing, so you see a smaller slice of the world. You are the one in charge. You can search for something new, switch off autoplay and decide when you have watched enough.',
  '[{"term":"Recommendation system","definition":"An AI that suggests things you might like, such as videos, songs or products."},{"term":"Watch history","definition":"The list of videos you have watched in an app."},{"term":"Autoplay","definition":"A setting that starts the next video automatically."},{"term":"Algorithm","definition":"A set of steps a computer follows to work something out."}]'::jsonb,
  array['Suggestions are predictions based on what you and similar viewers watched.', 'The system is designed to keep you watching, not to choose what is best for you.', 'You are in charge of what you watch and when you stop.']::text[],
  array['Helps you find videos about things you are interested in.', 'Saves time searching through millions of videos.', 'Can introduce you to new hobbies and topics.']::text[],
  array['Cannot tell whether a video is true or good for you.', 'Can keep showing the same kind of content again and again.', 'Is designed to keep you watching for longer.']::text[],
  array['If a video upsets or worries you, stop watching and tell a trusted adult.', 'Agree screen-time rules with a grown-up, and turn off autoplay if it makes stopping hard.', 'Use child-friendly settings or apps that an adult has set up for you.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('e2f19d12-fbd2-5115-85e4-faa2c43499e3', 'f521a56e-e7f0-5ac2-a08d-b65ed3e4d019', 'Quiz: How Does YouTube Recommend Videos?', 'How well do you understand video suggestions? Five questions.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('eff56b91-d2b4-5548-a426-93c2089fc598', 'e2f19d12-fbd2-5115-85e4-faa2c43499e3', 'What does a recommendation system do?', 'beginner', 'A recommendation system predicts what you might enjoy and suggests it to you.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('05938fba-f0b8-5799-a83f-5db59ca867a0', 'eff56b91-d2b4-5548-a426-93c2089fc598', 'Makes your screen brighter', false, 1),
  ('ae56ffca-5d0a-5b03-83bf-4b22ddf5bdb5', 'eff56b91-d2b4-5548-a426-93c2089fc598', 'Suggests things it predicts you will like', true, 2),
  ('6038659f-3edc-59aa-8ac7-178bd8d687d1', 'eff56b91-d2b4-5548-a426-93c2089fc598', 'Charges your tablet', false, 3),
  ('1ba6d7ad-bc25-551e-a6ae-1746d9fb5974', 'eff56b91-d2b4-5548-a426-93c2089fc598', 'Writes the scripts for videos', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('0fd3a6d0-1fac-549f-8884-b0493d7d5c3e', 'e2f19d12-fbd2-5115-85e4-faa2c43499e3', 'Which clue might a video app use to choose its suggestions?', 'beginner', 'Watching a video all the way through is a strong clue that you enjoyed it.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('70a07586-e188-5221-8613-7bfd03737d5d', '0fd3a6d0-1fac-549f-8884-b0493d7d5c3e', 'Your shoe size', false, 1),
  ('6d268181-33ca-5409-8e54-1e4a1be7951e', '0fd3a6d0-1fac-549f-8884-b0493d7d5c3e', 'The weather on Mars', false, 2),
  ('b17b01e6-6e0a-54bb-9c88-b014c89a0792', '0fd3a6d0-1fac-549f-8884-b0493d7d5c3e', 'Your favourite sandwich', false, 3),
  ('1f3ac874-8725-55d8-b01a-b6bd271983ce', '0fd3a6d0-1fac-549f-8884-b0493d7d5c3e', 'Which videos you watched to the end', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('1c7b11b9-45ff-5cf4-930f-527459d4f8a9', 'e2f19d12-fbd2-5115-85e4-faa2c43499e3', 'What is a recommendation system mainly designed to do?', 'beginner', 'The system is built to keep people watching. It cannot judge whether a video is true or good for you.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('66eb5af0-1095-570f-b5b6-7fcd4d0328fd', '1c7b11b9-45ff-5cf4-930f-527459d4f8a9', 'Keep people watching', true, 1),
  ('faff9502-8899-5893-8540-0d1cf898028e', '1c7b11b9-45ff-5cf4-930f-527459d4f8a9', 'Make sure every video is true', false, 2),
  ('3980a687-0ec8-5c30-a99b-84cc448b8b73', '1c7b11b9-45ff-5cf4-930f-527459d4f8a9', 'Send you to bed on time', false, 3),
  ('03d53643-eee7-5fb2-afc2-c068f22310b8', '1c7b11b9-45ff-5cf4-930f-527459d4f8a9', 'Teach you spelling', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('6b35885c-6444-5fee-868d-525a92730d71', 'e2f19d12-fbd2-5115-85e4-faa2c43499e3', 'Why might you keep seeing the same type of video?', 'beginner', 'The more you watch one kind of video, the more of that kind the system suggests.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('e85aabb0-83e7-530d-9aea-87a60620ad0f', '6b35885c-6444-5fee-868d-525a92730d71', 'The app has broken', false, 1),
  ('a536e288-66df-5729-a25e-de56680a6a96', '6b35885c-6444-5fee-868d-525a92730d71', 'There are no other videos', false, 2),
  ('46dc7ac5-d077-5a01-8ed7-fde00bdbb748', '6b35885c-6444-5fee-868d-525a92730d71', 'The AI predicts you like that type because you watched it before', true, 3),
  ('7ba501ee-e9a2-50fe-b376-34b4da249b99', '6b35885c-6444-5fee-868d-525a92730d71', 'Your tablet is too old', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('8757921d-d210-59ec-9221-742336e89087', 'e2f19d12-fbd2-5115-85e4-faa2c43499e3', 'Who should decide when you stop watching?', 'beginner', 'You are in charge, not the app. Agreed screen-time rules make stopping easier.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('8c9e8102-bd89-5082-8030-7c3567cec9df', '8757921d-d210-59ec-9221-742336e89087', 'The autoplay button', false, 1),
  ('a481043d-b0fb-5832-9aae-aafa2057525b', '8757921d-d210-59ec-9221-742336e89087', 'You, following the rules you agreed with a grown-up', true, 2),
  ('c75cd37c-bb0d-5bde-92a8-316ba75f9c54', '8757921d-d210-59ec-9221-742336e89087', 'The recommendation system', false, 3),
  ('1da506af-0cc5-5e1c-895b-1be971344529', '8757921d-d210-59ec-9221-742336e89087', 'Whoever made the video', false, 4)
on conflict (id) do nothing;

-- Lesson: How Does Google Maps Use AI?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  '071f4bcc-1a74-5772-9e83-7db062070e45',
  'afc53426-1801-5fa5-bbda-21d664e3e8c1',
  'How Does Google Maps Use AI?',
  'how-does-google-maps-use-ai',
  'A maps app can predict a traffic jam before you reach it. Find out how AI helps plan the quickest journey.',
  '8-12',
  'beginner',
  9,
  2,
  array['Describe how a maps app uses data to estimate traffic.', 'Explain how AI predicts how long a journey will take.', 'Understand why a map can sometimes be wrong.']::text[],
  'How does a maps app such as Google Maps know that the high street is jammed while you are still at home putting your shoes on?

Many phones can share their location with the maps service when people allow it. The service does not need to know who those people are. It looks at lots of phones together: if hundreds of them are crawling along one road, the traffic there must be slow, and the road is coloured red on the map.

AI adds something extra: prediction. It has learned patterns from years of journeys. It knows that a road near a school gets busy at half past three, and that the motorway is quiet on Sunday mornings. By combining what is happening right now with those patterns, it predicts what the traffic will be like when you actually get there.

Then the app compares many possible routes and suggests the one it expects to be fastest, with an estimated time of arrival.

AI also helps keep the map itself up to date by spotting road names, signs and new buildings in street and satellite photos.

Maps are helpful, but they are not perfect. A road might have closed five minutes ago, or the signal might be weak. So people still need to use their eyes, follow road signs and stay sensible.',
  '[{"term":"Location data","definition":"Information about where a device is."},{"term":"Estimated time of arrival (ETA)","definition":"A prediction of when you will reach a place."},{"term":"Route","definition":"The path you take to get somewhere."},{"term":"Satellite image","definition":"A photo of the ground taken from space."}]'::jsonb,
  array['Maps apps combine live location data with patterns from past journeys.', 'AI predicts traffic to suggest the fastest route and an arrival time.', 'A map is a helpful guide, not a guarantee.']::text[],
  array['Helps people avoid traffic jams and save time.', 'Can suggest walking, cycling and public transport routes.', 'Updates quickly when the traffic changes.']::text[],
  array['Can be wrong when something has just changed, such as a new road closure.', 'Needs a good signal and up-to-date data to work well.', 'Does not know what you can see with your own eyes.']::text[],
  array['Sharing your location is a choice. Ask a trusted adult before turning location sharing on in any app.', 'Never share where you are with people you do not know.', 'Do not look at a map while crossing a road. Stop somewhere safe first.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('7dcfd4e9-56a2-55d7-863a-c79771fbc3e3', '071f4bcc-1a74-5772-9e83-7db062070e45', 'Quiz: How Does Google Maps Use AI?', 'Five questions about maps, traffic and predictions.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('de1786cd-8e16-5af1-9273-777d095f165d', '7dcfd4e9-56a2-55d7-863a-c79771fbc3e3', 'How can a maps app tell that a road is busy?', 'beginner', 'When lots of phones on one road are moving slowly, the service can tell the traffic is slow.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('8dad8cb8-6061-5cdf-b142-1ce433e2ce3b', 'de1786cd-8e16-5af1-9273-777d095f165d', 'It listens for car horns', false, 1),
  ('dd5698fd-709b-57b3-b15c-e07cd71e92ca', 'de1786cd-8e16-5af1-9273-777d095f165d', 'A person counts cars from a helicopter all day', false, 2),
  ('ad6b9c44-733c-58b1-8643-01faa620a39a', 'de1786cd-8e16-5af1-9273-777d095f165d', 'It looks at how slowly many phones are moving along that road', true, 3),
  ('2b4e2395-e735-5a12-a691-b20dccbc064f', 'de1786cd-8e16-5af1-9273-777d095f165d', 'It guesses at random', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('ac07a237-b9de-59ac-b157-6ad7116edc14', '7dcfd4e9-56a2-55d7-863a-c79771fbc3e3', 'What does AI add to the live traffic information?', 'beginner', 'AI has learned patterns, such as busy school-run times, and uses them to predict traffic.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('a9f24dbb-8642-57e5-973a-52d64dac6798', 'ac07a237-b9de-59ac-b157-6ad7116edc14', 'Predictions based on patterns from past journeys', true, 1),
  ('a0055ffd-e6a8-5205-8a64-142fcabfd4e5', 'ac07a237-b9de-59ac-b157-6ad7116edc14', 'Louder directions', false, 2),
  ('48e69975-f44a-52e6-8b9c-166faee575de', 'ac07a237-b9de-59ac-b157-6ad7116edc14', 'Extra petrol', false, 3),
  ('17150a60-4e3e-5edc-97e6-62b1295d6d19', 'ac07a237-b9de-59ac-b157-6ad7116edc14', 'Faster cars', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('1d490a53-accb-5f81-a630-7f0e55cc868a', '7dcfd4e9-56a2-55d7-863a-c79771fbc3e3', 'What does ETA stand for?', 'beginner', 'ETA means estimated time of arrival: a prediction of when you will get there.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('c964c109-53d9-5ba0-897e-5adcd8896224', '1d490a53-accb-5f81-a630-7f0e55cc868a', 'Every Tuesday Afternoon', false, 1),
  ('40db90dc-d1a6-5e21-907d-65e9e62c9a61', '1d490a53-accb-5f81-a630-7f0e55cc868a', 'Estimated Time of Arrival', true, 2),
  ('a182d995-efa0-5f32-b7b9-1b7cea75c8ff', '1d490a53-accb-5f81-a630-7f0e55cc868a', 'Extra Traffic Ahead', false, 3),
  ('3b1ebdaa-9820-5776-949e-5200081580c9', '1d490a53-accb-5f81-a630-7f0e55cc868a', 'Easy Travel App', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('5dcd9b4a-5e73-5862-907c-0f2f89e40272', '7dcfd4e9-56a2-55d7-863a-c79771fbc3e3', 'Why might the map sometimes be wrong?', 'beginner', 'Maps depend on up-to-date data. Very recent changes may not have reached the app yet.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('6c5304fa-50f5-5332-aad3-668f766092eb', '5dcd9b4a-5e73-5862-907c-0f2f89e40272', 'Maps are always wrong', false, 1),
  ('d42b9f95-4fee-5a61-891e-0d795296f0dd', '5dcd9b4a-5e73-5862-907c-0f2f89e40272', 'AI dislikes drivers', false, 2),
  ('3ddb7b58-c285-5dfd-a14f-7a749263b595', '5dcd9b4a-5e73-5862-907c-0f2f89e40272', 'Roads move at night', false, 3),
  ('2172e7bd-b1b3-5523-aae4-a13fc962ae01', '5dcd9b4a-5e73-5862-907c-0f2f89e40272', 'A road may have just closed and the app has not found out yet', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('92bde9ac-4dcc-5c76-a0f5-05daab6d95d3', '7dcfd4e9-56a2-55d7-863a-c79771fbc3e3', 'What should you do before turning on location sharing in an app?', 'beginner', 'Your location is personal information. A trusted adult can help you decide what is safe.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('fa0aa925-9b47-5ac4-91b5-fac1a068066c', '92bde9ac-4dcc-5c76-a0f5-05daab6d95d3', 'Share it with everyone', false, 1),
  ('72e5af83-ec7b-5b76-b447-70809499a809', '92bde9ac-4dcc-5c76-a0f5-05daab6d95d3', 'Post your address online', false, 2),
  ('1e521745-f659-53b4-832d-dcdf5d5e5f64', '92bde9ac-4dcc-5c76-a0f5-05daab6d95d3', 'Ask a trusted adult', true, 3),
  ('5a069490-2130-5fb9-b651-d6e8266acf28', '92bde9ac-4dcc-5c76-a0f5-05daab6d95d3', 'Nothing. It is always safe', false, 4)
on conflict (id) do nothing;

-- Lesson: Can AI Create a Photograph?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  '0675bcd1-5b02-57e3-a52c-ae61fb4cfc2a',
  '112f6f5f-f368-524a-9106-39573bb8680f',
  'Can AI Create a Photograph?',
  'can-ai-create-a-photograph',
  'AI can turn a sentence into a picture that looks like a photo. Learn how it works and why that picture is not a real photograph.',
  '8-12',
  'beginner',
  9,
  1,
  array['Explain the difference between a photograph and an AI-generated image.', 'Describe how a text prompt becomes a picture.', 'Spot clues that an image might have been made by AI.']::text[],
  'A photograph is made when a camera captures light from a real moment: your dog jumping, a sunset, a birthday cake. Something really happened in front of the lens.

An AI image generator works differently. You type a description, called a prompt, such as “a purple elephant skateboarding on the Moon”, and the AI builds a brand-new picture to match.

How? During training, the AI studied an enormous number of pictures together with words describing them. It learned patterns: what fur looks like, how shadows fall, what a skateboard usually looks like. When you give it a prompt, it starts from a blur of random dots and improves it step by step until the picture matches the words.

The result can look just like a photo. But no camera was there and that moment never happened. So it is more accurate to call it an AI-generated image than a photograph.

Sometimes there are clues: strange hands, jumbled writing on signs, or earrings that do not match. But the tools are improving quickly, so you cannot always tell just by looking.

AI images can be wonderful for imagination and play. The important part is honesty: say when a picture was made with AI, and never use one to trick anybody.',
  '[{"term":"Prompt","definition":"The words you give an AI to tell it what to make."},{"term":"AI-generated image","definition":"A picture created by an AI program rather than captured by a camera."},{"term":"Image generator","definition":"An AI tool that makes pictures from descriptions."},{"term":"Label","definition":"A note that tells people how something was made."}]'::jsonb,
  array['A photograph captures a real moment; an AI image is built from learned patterns.', 'AI images can look real even though the scene never happened.', 'Be honest: say when a picture was made with AI.']::text[],
  array['Lets you picture things that could never be photographed, like a dragon in your garden.', 'Helps people sketch ideas quickly for stories, games and projects.', 'Makes creating pictures possible for people who find drawing difficult.']::text[],
  array['Can make mistakes, such as odd hands or scrambled writing.', 'Can be used to make things look real when they never happened.', 'Learns from pictures made by human artists, which raises questions about fairness and permission.']::text[],
  array['Never upload photos of yourself, your friends or your family to an AI tool without a trusted adult''s permission.', 'Never make or share a fake picture of a real person. It can hurt people.', 'If a picture online looks amazing or shocking, ask “Could this be AI?” before you believe or share it.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('fbb68f9b-a3b7-52a8-a559-0ca85f376b26', '0675bcd1-5b02-57e3-a52c-ae61fb4cfc2a', 'Quiz: Can AI Create a Photograph?', 'Photo or AI picture? Five questions to test your eye.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('5808fd6f-3930-56aa-8967-63388da9ab12', 'fbb68f9b-a3b7-52a8-a559-0ca85f376b26', 'What is a prompt?', 'beginner', 'A prompt is the description you type to tell the AI what you want.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('00a7f177-b5af-5a81-ba8e-a9e4dc5ba75d', '5808fd6f-3930-56aa-8967-63388da9ab12', 'A type of camera lens', false, 1),
  ('79cb2c5c-33ff-556d-ba8c-788b0366d9d0', '5808fd6f-3930-56aa-8967-63388da9ab12', 'The words you give an AI to tell it what to make', true, 2),
  ('98387a10-3041-5806-bfbd-819782f75d57', '5808fd6f-3930-56aa-8967-63388da9ab12', 'A battery charger', false, 3),
  ('96cd8317-cd31-5c01-8c8b-6982591d45ad', '5808fd6f-3930-56aa-8967-63388da9ab12', 'A photo frame', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('740f3370-b9f0-55ca-805a-cc94315e2681', 'fbb68f9b-a3b7-52a8-a559-0ca85f376b26', 'What is the main difference between a photograph and an AI-generated image?', 'beginner', 'A camera records something that really happened. An AI image shows a scene that never existed.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('b5d76003-2cc9-5806-8249-12c75de7d714', '740f3370-b9f0-55ca-805a-cc94315e2681', 'Photographs are always in colour', false, 1),
  ('617789a6-6dfb-52e3-ac58-45f860569bac', '740f3370-b9f0-55ca-805a-cc94315e2681', 'AI images are always cartoons', false, 2),
  ('7059e246-0dad-5196-9ce5-9b6cdf4f56a9', '740f3370-b9f0-55ca-805a-cc94315e2681', 'There is no difference', false, 3),
  ('5991aeaf-c21e-5706-aae6-335643bb1417', '740f3370-b9f0-55ca-805a-cc94315e2681', 'A photograph captures a real moment; an AI image is built from learned patterns', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('982711a5-3c52-5302-adb8-6791ccf45548', 'fbb68f9b-a3b7-52a8-a559-0ca85f376b26', 'Which could be a clue that an image was made by AI?', 'beginner', 'AI images sometimes contain scrambled writing or odd details, although not always.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('16c67cbd-fceb-567d-81b7-38d13f09442d', '982711a5-3c52-5302-adb8-6791ccf45548', 'Writing on a sign is jumbled nonsense', true, 1),
  ('b35ffafd-9c29-512d-9f4e-fafc4e72faa8', '982711a5-3c52-5302-adb8-6791ccf45548', 'It has a blue sky', false, 2),
  ('c4975cfd-aadb-57fd-89da-8586abf099c7', '982711a5-3c52-5302-adb8-6791ccf45548', 'It shows an animal', false, 3),
  ('bba8bd5c-26af-540c-9caf-a33fdee603be', '982711a5-3c52-5302-adb8-6791ccf45548', 'It is a rectangle', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('a0e37697-4ebf-5aec-ab82-654b733d551a', 'fbb68f9b-a3b7-52a8-a559-0ca85f376b26', 'What is the honest thing to do when you share a picture made with AI?', 'beginner', 'Telling people how a picture was made means nobody is tricked.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('8d486c85-121e-57c6-8e86-b85298dc64da', 'a0e37697-4ebf-5aec-ab82-654b733d551a', 'Say a famous artist drew it', false, 1),
  ('8dc89435-ae18-55c7-a998-8f3b907345a9', 'a0e37697-4ebf-5aec-ab82-654b733d551a', 'Pretend you took it with a camera', false, 2),
  ('fe115958-bde7-5baf-962a-a056dca3ea0a', 'a0e37697-4ebf-5aec-ab82-654b733d551a', 'Say that it was made with AI', true, 3),
  ('83a16687-f668-5e95-b228-eac63163c64d', 'a0e37697-4ebf-5aec-ab82-654b733d551a', 'Say nothing and hope nobody asks', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('99b760e9-f01b-5f16-ad4c-8ee3de1e84ba', 'fbb68f9b-a3b7-52a8-a559-0ca85f376b26', 'Before uploading a photo of a friend to an AI tool, you should…', 'beginner', 'A photo of a person is personal information. You need permission, and an adult should help.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('a249ecc5-f7ef-50b5-abf4-616300200322', '99b760e9-f01b-5f16-ad4c-8ee3de1e84ba', 'Do it quickly so nobody notices', false, 1),
  ('f03aff3c-8547-5bda-bfde-b43b47773854', '99b760e9-f01b-5f16-ad4c-8ee3de1e84ba', 'Have permission and ask a trusted adult', true, 2),
  ('f5246357-8b16-59ab-9b3b-f4c367b33b33', '99b760e9-f01b-5f16-ad4c-8ee3de1e84ba', 'Add their home address', false, 3),
  ('00bee504-784b-5b12-8854-3617ca83f798', '99b760e9-f01b-5f16-ad4c-8ee3de1e84ba', 'Share it everywhere first', false, 4)
on conflict (id) do nothing;

-- Lesson: How Can AI Help Us Write Stories?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  'd114ddd3-1a18-5d15-8d00-d6e0a51587ba',
  '112f6f5f-f368-524a-9106-39573bb8680f',
  'How Can AI Help Us Write Stories?',
  'how-can-ai-help-us-write-stories',
  'AI can suggest ideas, characters and plot twists. Find out how to use it as a writing helper while keeping the story your own.',
  '8-12',
  'beginner',
  8,
  2,
  array['Describe ways an AI can help with story writing.', 'Explain why your own ideas and voice matter.', 'Use AI help honestly and check what it writes.']::text[],
  'Every writer gets stuck sometimes. You have a brave hero and a spooky castle, but what happens next? This is where an AI writing helper can be useful.

AI writing tools have been trained on enormous amounts of text. From that, they learned patterns in how words and stories fit together. When you ask a question, the AI predicts words that make a sensible reply.

That makes it a handy brainstorming partner. You could ask for ten unusual names for a dragon, three ways your hero might escape a locked tower, or a different word for “walked”. You pick the ideas you like, change them and throw the rest away.

But there are things the AI does not have: your life, your feelings and your sense of humour. It has never been nervous on the first day of school or laughed until its tummy hurt. Those things make your story different from everyone else''s. If the AI writes the whole thing, the story may sound flat and a bit like many others, and it will not really be yours.

AI can also get facts wrong, so check anything that is meant to be true.

Think of AI as a helper sitting beside you, not as the author. And be honest: if AI helped, say so, and follow your school''s rules.',
  '[{"term":"Brainstorm","definition":"To come up with lots of ideas quickly, without worrying whether they are perfect."},{"term":"Draft","definition":"An early version of a piece of writing that you plan to improve."},{"term":"Author","definition":"The person who creates a piece of writing and is responsible for it."},{"term":"Plot","definition":"The main events that happen in a story."}]'::jsonb,
  array['AI is a useful brainstorming partner when you are stuck.', 'Your experiences and imagination make a story truly yours.', 'Be honest about AI help and check any facts.']::text[],
  array['Offers lots of ideas quickly when you feel stuck.', 'Can suggest new words and different ways to say something.', 'Can ask you questions that help you plan your story.']::text[],
  array['Has no real experiences or feelings to write from.', 'Its stories can sound similar to many others.', 'May include mistakes or made-up facts.']::text[],
  array['Do not type your full name, address, school or other private details into an AI tool.', 'Handing in AI writing as your own work is not honest. Follow your teacher''s rules.', 'If an AI writes something that feels scary or unkind, stop and tell a trusted adult.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('bc2b6a13-93e3-537a-9ca8-3b79552fda55', 'd114ddd3-1a18-5d15-8d00-d6e0a51587ba', 'Quiz: How Can AI Help Us Write Stories?', 'Five questions about writing with an AI helper.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('a02a8a11-6a52-59b5-8876-4d5882d0cad9', 'bc2b6a13-93e3-537a-9ca8-3b79552fda55', 'Which is a good way to use AI when writing a story?', 'beginner', 'AI works best as a brainstorming partner. You stay the author by choosing and shaping the ideas.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('c08aba62-afa7-5f62-9450-901dd1403cd0', 'a02a8a11-6a52-59b5-8876-4d5882d0cad9', 'Let it write everything and put your name on it', false, 1),
  ('a0362d92-e77a-5461-92ab-ff1975e63765', 'a02a8a11-6a52-59b5-8876-4d5882d0cad9', 'Type in your home address to make it realistic', false, 2),
  ('2919a210-32a8-595e-bc22-94aa2dc96d0b', 'a02a8a11-6a52-59b5-8876-4d5882d0cad9', 'Ask it for ideas when you are stuck, then choose and change them yourself', true, 3),
  ('aa4669e1-3f0c-538f-8c59-bfa785ca41b4', 'a02a8a11-6a52-59b5-8876-4d5882d0cad9', 'Copy another child''s story', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('320e02df-fd1a-55be-bb17-1ad8fa886d46', 'bc2b6a13-93e3-537a-9ca8-3b79552fda55', 'What does “brainstorm” mean?', 'beginner', 'Brainstorming means collecting many ideas first and choosing the best later.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('de24028f-055f-5791-a402-2a5fa44c0533', '320e02df-fd1a-55be-bb17-1ad8fa886d46', 'To come up with lots of ideas quickly', true, 1),
  ('296e3d4b-b5a8-5059-a69d-89195a0caecb', '320e02df-fd1a-55be-bb17-1ad8fa886d46', 'To have a headache', false, 2),
  ('377655b7-9f2d-503e-ac13-ee56b94dd83c', '320e02df-fd1a-55be-bb17-1ad8fa886d46', 'A type of thunderstorm', false, 3),
  ('69d65c3e-d9b1-55ca-8415-dee7ee65d767', '320e02df-fd1a-55be-bb17-1ad8fa886d46', 'To delete your work', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('5beea129-ed50-52d8-a62f-be12da6c71ba', 'bc2b6a13-93e3-537a-9ca8-3b79552fda55', 'What makes your story different from a story written by an AI?', 'beginner', 'Only you have lived your life. That is what makes your writing yours.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('748ecae2-ab6c-5043-b8e0-11c07699045a', '5beea129-ed50-52d8-a62f-be12da6c71ba', 'Using longer words', false, 1),
  ('513f0239-7263-517c-a1fe-0575554cd8f9', '5beea129-ed50-52d8-a62f-be12da6c71ba', 'Typing faster', false, 2),
  ('fd5c9387-7f92-5e7b-8a75-59085441af5b', '5beea129-ed50-52d8-a62f-be12da6c71ba', 'A fancier font', false, 3),
  ('34525931-83c0-5697-8ff6-b26b3f1d0ecf', '5beea129-ed50-52d8-a62f-be12da6c71ba', 'Your own experiences, feelings and imagination', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('a6d8f925-90f0-54d3-afcd-929b3f97d434', 'bc2b6a13-93e3-537a-9ca8-3b79552fda55', 'An AI helper adds a “fact” to your story about how tall a mountain is. What should you do?', 'beginner', 'AI can invent facts that sound right. Check them before you use them.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('435da3f4-818a-5ff7-8d10-9fe20c458366', 'a6d8f925-90f0-54d3-afcd-929b3f97d434', 'Trust it completely', false, 1),
  ('d3e7f859-40f6-55b6-9ffe-46eb43885b70', 'a6d8f925-90f0-54d3-afcd-929b3f97d434', 'Check it using a reliable source', true, 2),
  ('0c94dc95-b7b0-5f6a-bb50-33791c74cdf9', 'a6d8f925-90f0-54d3-afcd-929b3f97d434', 'Make the number bigger', false, 3),
  ('06260acb-cbaa-5d87-a049-adea14439d69', 'a6d8f925-90f0-54d3-afcd-929b3f97d434', 'Remove every fact from the story', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('c03ed5ac-ca4d-5cc4-80f7-4fb840d7fa47', 'bc2b6a13-93e3-537a-9ca8-3b79552fda55', 'If AI helped with your homework, what is the honest thing to do?', 'beginner', 'Being open about AI help is honest, and it lets your teacher support you.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('0c4e8512-c86a-56dc-9074-fe0cac57a0c1', 'c03ed5ac-ca4d-5cc4-80f7-4fb840d7fa47', 'Hide it', false, 1),
  ('2146babe-5283-5ecf-a729-3d260281318a', 'c03ed5ac-ca4d-5cc4-80f7-4fb840d7fa47', 'Blame a friend', false, 2),
  ('17184fc4-3cfd-5107-9301-aadb56732161', 'c03ed5ac-ca4d-5cc4-80f7-4fb840d7fa47', 'Say so and follow your school''s rules', true, 3),
  ('84a1758e-819c-548f-bafb-7acdde346902', 'c03ed5ac-ca4d-5cc4-80f7-4fb840d7fa47', 'Say the dog wrote it', false, 4)
on conflict (id) do nothing;

-- Lesson: What Is a Deepfake?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  '2bd766e1-9c75-5a37-888b-067089ff1360',
  'f52a06f0-8a87-5989-be94-4b08f6a58eb8',
  'What Is a Deepfake?',
  'what-is-a-deepfake',
  'Some videos show people saying things they never said. Learn what deepfakes are, how they are made and how to stay calm and careful.',
  '8-12',
  'intermediate',
  9,
  1,
  array['Explain what a deepfake is.', 'Describe why deepfakes can be harmful.', 'List the steps to take when a video or voice clip seems suspicious.']::text[],
  'Imagine a video in which a famous footballer announces that homework is banned for ever. It looks like them. It sounds like them. But they never said it. A video like that is called a deepfake.

A deepfake is a video, picture or sound recording that has been made or changed using AI so that a person appears to do or say something they never did. The AI studies many real photos or recordings of someone''s face or voice, learns the patterns, and then creates a convincing copy.

Not every use of this technology is bad. Film-makers use similar tools for special effects, with the actors'' permission. The problem comes when deepfakes are used to trick people, spread lies, cheat people out of money or embarrass someone.

Deepfakes can be hard to spot. Sometimes the blinking looks odd, the lips do not quite match the words, or the voice sounds flat. But you cannot rely on clues alone, because the fakes keep getting better.

So detectives use questions instead. Who posted this? Is a trustworthy news source reporting the same thing? Does it seem designed to shock me or make me angry? If something feels off, pause. Do not share it. Ask a trusted adult to help you check.',
  '[{"term":"Deepfake","definition":"A video, picture or sound recording made or changed with AI so that someone appears to say or do something they never did."},{"term":"Misinformation","definition":"False or misleading information."},{"term":"Source","definition":"Where a piece of information comes from."},{"term":"Permission","definition":"Agreement from a person before you do something that involves them."}]'::jsonb,
  array['A deepfake makes someone appear to say or do something they never did.', 'You cannot always spot a deepfake just by looking.', 'Pause, do not share, and check with a trusted adult.']::text[],
  array['The same technology can create film special effects when actors agree to it.', 'It can help translate videos so that lips match a new language.', 'Learning about it helps everyone become harder to trick.']::text[],
  array['Detection tools and visual clues do not always work.', 'Fakes are improving, so yesterday''s tips may not work tomorrow.', 'A fake can spread widely before anyone corrects it.']::text[],
  array['Never create or share a fake video, picture or voice clip of a real person. It can seriously hurt them.', 'If you see a deepfake of yourself or someone you know, tell a trusted adult straight away. It is not your fault.', 'If a message or call sounds like someone you know but asks for money, passwords or secrets, stop and check with an adult.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('3f49494a-2fb2-56d5-89ac-48d89ebe20dd', '2bd766e1-9c75-5a37-888b-067089ff1360', 'Quiz: What Is a Deepfake?', 'Put on your detective hat. Five questions about deepfakes.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('1b08672f-32d4-5c8f-af74-e967d6dbdcc8', '3f49494a-2fb2-56d5-89ac-48d89ebe20dd', 'What is a deepfake?', 'intermediate', 'A deepfake uses AI to copy a person''s face or voice and make them appear to do something they did not.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('5ebdaba2-921d-543a-8482-060f1a84c5ec', '1b08672f-32d4-5c8f-af74-e967d6dbdcc8', 'A very deep swimming pool', false, 1),
  ('83806252-6c42-5ef2-950e-1bedb48b3300', '1b08672f-32d4-5c8f-af74-e967d6dbdcc8', 'A photo taken underwater', false, 2),
  ('13f65d86-0703-51f7-b1a2-a785761ee53a', '1b08672f-32d4-5c8f-af74-e967d6dbdcc8', 'A video, picture or sound made with AI so someone seems to do or say something they never did', true, 3),
  ('5e8c75ef-476c-5c4a-a079-0142610ffd0a', '1b08672f-32d4-5c8f-af74-e967d6dbdcc8', 'A broken video file', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('c6300e93-064a-52dd-be80-9ab8c93653a1', '3f49494a-2fb2-56d5-89ac-48d89ebe20dd', 'Why can deepfakes be harmful?', 'intermediate', 'Deepfakes can make people believe things that are not true and can hurt the person who was copied.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('7279e1af-43ad-5863-9e70-308448241ec0', 'c6300e93-064a-52dd-be80-9ab8c93653a1', 'They can be used to trick people and spread lies', true, 1),
  ('caf3736e-6810-548e-8ef5-a7e9a44a7f60', 'c6300e93-064a-52dd-be80-9ab8c93653a1', 'They use too much electricity', false, 2),
  ('74642ac0-1c20-56f9-a848-c0ff2c4fdbad', 'c6300e93-064a-52dd-be80-9ab8c93653a1', 'They are always too quiet', false, 3),
  ('a3dd31a4-9174-5b70-ab0a-a7f8d99be0d9', 'c6300e93-064a-52dd-be80-9ab8c93653a1', 'They make screens crack', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('ecc24cf2-f7fe-5321-b2c1-5386b6d8940f', '3f49494a-2fb2-56d5-89ac-48d89ebe20dd', 'Can you always tell a deepfake just by looking carefully?', 'intermediate', 'Clues like odd blinking can help, but fakes keep improving. Checking the source matters more.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('515b0fa4-0da9-5893-9e58-c82f2959568c', 'ecc24cf2-f7fe-5321-b2c1-5386b6d8940f', 'Yes, always', false, 1),
  ('b27da9bd-a479-588e-ba86-ddaa30ccf546', 'ecc24cf2-f7fe-5321-b2c1-5386b6d8940f', 'Only on Tuesdays', false, 2),
  ('4ed82bde-02c7-593b-9208-e8ceaa3ef79f', 'ecc24cf2-f7fe-5321-b2c1-5386b6d8940f', 'Only if it is in black and white', false, 3),
  ('cac884c7-1508-5053-946a-94764211d568', 'ecc24cf2-f7fe-5321-b2c1-5386b6d8940f', 'No. Some are very convincing, so you need to check the source too', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('17d7e3f3-3eb2-5ddd-8ca8-789ed6957c78', '3f49494a-2fb2-56d5-89ac-48d89ebe20dd', 'You see a shocking video of a celebrity. What is the best first step?', 'intermediate', 'Shocking clips are exactly the ones to check before believing or sharing.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('59b8914b-1e22-5c27-b900-9872b3ab5826', '17d7e3f3-3eb2-5ddd-8ca8-789ed6957c78', 'Share it with everyone immediately', false, 1),
  ('15305a2d-b6a7-5460-8e5d-cc26d82fe74e', '17d7e3f3-3eb2-5ddd-8ca8-789ed6957c78', 'Pause and check whether trustworthy sources report the same thing', true, 2),
  ('0ddb9037-87ee-59eb-b171-f999a367426b', '17d7e3f3-3eb2-5ddd-8ca8-789ed6957c78', 'Believe it because it looks real', false, 3),
  ('f503d66c-508f-53f2-ad29-4622d78b10f8', '17d7e3f3-3eb2-5ddd-8ca8-789ed6957c78', 'Make your own version', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('023354f6-2e84-52ab-99bb-64f0fbf9078f', '3f49494a-2fb2-56d5-89ac-48d89ebe20dd', 'Someone makes a fake video of a classmate as a “joke”. What should you do?', 'intermediate', 'Fake videos of real people can really hurt them. Not sharing and telling an adult protects your classmate.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('e42ccf49-ed88-5641-aa28-7c7c5cb97ca4', '023354f6-2e84-52ab-99bb-64f0fbf9078f', 'Share it so others can laugh', false, 1),
  ('54f044ba-df98-53a3-8f73-039f343ea695', '023354f6-2e84-52ab-99bb-64f0fbf9078f', 'Make another one', false, 2),
  ('87486ebe-4642-507e-8efd-70568a55b777', '023354f6-2e84-52ab-99bb-64f0fbf9078f', 'Do not share it, and tell a trusted adult', true, 3),
  ('19b88b42-643f-5321-910b-0073bbbc456f', '023354f6-2e84-52ab-99bb-64f0fbf9078f', 'Keep it secret for ever', false, 4)
on conflict (id) do nothing;

-- Lesson: How Can We Check Whether Online Information Is Genuine?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  'aca6909c-e610-50c5-8c04-52ad697f133a',
  'f52a06f0-8a87-5989-be94-4b08f6a58eb8',
  'How Can We Check Whether Online Information Is Genuine?',
  'how-to-check-online-information',
  'Become a fact detective. Learn simple checks that help you decide whether something online can be trusted.',
  '8-12',
  'intermediate',
  10,
  2,
  array['Use three questions to check online information.', 'Explain why checking more than one source matters.', 'Recognise warning signs that something may be false.']::text[],
  'The internet is like the biggest library in the world, except that anybody can put a book on the shelf. Some of it is carefully checked. Some is a mistake. Some is made up on purpose. And now AI tools can produce realistic text, pictures and videos in seconds. So how do you know what is genuine?

Good detectives ask questions. Here are three.

One: who made this? Look for the author or the organisation. Is it a known news service, a museum, a school or a scientist? Or is it an account you have never heard of?

Two: can I find it somewhere else? Real news is usually reported by several trustworthy sources. If only one strange website says that chocolate cures colds, be suspicious.

Three: how does it make me feel? False stories are often designed to make you shocked, scared or angry, because strong feelings make people share without thinking.

There are other clues too. Check the date, because old news is sometimes shared as if it were new. Look closely at pictures. And remember that AI chatbots can make mistakes or invent things, so their answers need checking as well.

You do not have to do this alone. When you are unsure, pause before sharing and ask a parent, carer, teacher or librarian.',
  '[{"term":"Source","definition":"Where a piece of information comes from."},{"term":"Fact-check","definition":"To check whether a claim is true by using reliable sources."},{"term":"Reliable","definition":"Something you can trust because it has been right before and can be checked."},{"term":"Evidence","definition":"Facts or proof that show whether something is true."}]'::jsonb,
  array['Ask: who made this, can I find it elsewhere, and how does it make me feel?', 'Check more than one trustworthy source before you believe or share.', 'Pause and ask an adult when you are not sure.']::text[],
  array['Checking sources helps you avoid being tricked.', 'You become a person others can trust for good information.', 'AI search tools can help you find sources quickly, as long as you then check them.']::text[],
  array['Even trusted sources sometimes make mistakes.', 'AI tools can invent facts or sources that do not exist.', 'Fakes are becoming more realistic, so checking takes care and time.']::text[],
  array['Do not click links or download files from messages you were not expecting.', 'Never share something just because it is shocking. Pause first.', 'If something online frightens or confuses you, tell a trusted adult.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('942d376f-d0dd-5e30-9282-5c1b8a8bdeef', 'aca6909c-e610-50c5-8c04-52ad697f133a', 'Quiz: How Can We Check Whether Online Information Is Genuine?', 'Five questions to earn your fact-detective badge.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('f84fe02e-0088-5aee-85b2-4d29e796bd7f', '942d376f-d0dd-5e30-9282-5c1b8a8bdeef', 'Which question helps you check whether information is genuine?', 'intermediate', 'Knowing who made something is the first step in deciding whether to trust it.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('72ed25ad-5948-520e-b2d4-d795238a0e3a', 'f84fe02e-0088-5aee-85b2-4d29e796bd7f', 'Is it written in capital letters?', false, 1),
  ('33d7df14-01f0-5f4a-b715-037a8ec22743', 'f84fe02e-0088-5aee-85b2-4d29e796bd7f', 'Does it have lots of emojis?', false, 2),
  ('f10a7adb-04ae-56cd-84b4-0d635e5bd17e', 'f84fe02e-0088-5aee-85b2-4d29e796bd7f', 'Is it long?', false, 3),
  ('9b63949d-bdf5-576a-a0c6-b9ac5bdb105b', 'f84fe02e-0088-5aee-85b2-4d29e796bd7f', 'Who made this, and can they be trusted?', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('aa2d96e4-b3ee-512e-8f9e-5560b3178cf6', '942d376f-d0dd-5e30-9282-5c1b8a8bdeef', 'Only one unknown website reports an amazing story. What should you think?', 'intermediate', 'Real news is usually reported by several trustworthy sources, not just one.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('9e353f4b-d8f8-5877-acee-1bb2ac8cae3f', 'aa2d96e4-b3ee-512e-8f9e-5560b3178cf6', 'It must be true', false, 1),
  ('50c2b9aa-31a0-5093-bc4f-caa59c173551', 'aa2d96e4-b3ee-512e-8f9e-5560b3178cf6', 'Be suspicious and look for other trustworthy sources', true, 2),
  ('42ae4733-9c04-5eed-b12e-a730376e22f3', 'aa2d96e4-b3ee-512e-8f9e-5560b3178cf6', 'Share it quickly before it disappears', false, 3),
  ('1e4cb70f-5c2a-55e5-ba8a-acca39c76ddd', 'aa2d96e4-b3ee-512e-8f9e-5560b3178cf6', 'It is secret news', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('24946a2f-bfde-53d8-99f3-2923b95b9189', '942d376f-d0dd-5e30-9282-5c1b8a8bdeef', 'Why are false stories often shocking or scary?', 'intermediate', 'Stories designed to shock spread quickly, because people share them before checking.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('61821433-2a06-580d-89f6-123d2c1049fc', '24946a2f-bfde-53d8-99f3-2923b95b9189', 'Because strong feelings make people share without thinking', true, 1),
  ('39eaed7a-b14f-50ef-b783-a4073e79f9fd', '24946a2f-bfde-53d8-99f3-2923b95b9189', 'Because true stories are always boring', false, 2),
  ('42d3655d-0e33-5abb-9d24-32ea3e6e6e7d', '24946a2f-bfde-53d8-99f3-2923b95b9189', 'Because computers like drama', false, 3),
  ('65944d67-921a-55eb-8be8-52c47b2f10f1', '24946a2f-bfde-53d8-99f3-2923b95b9189', 'It happens by accident', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('e1d39f3a-3dd6-571a-9c36-3b63f02e818b', '942d376f-d0dd-5e30-9282-5c1b8a8bdeef', 'An AI chatbot gives you a fact for your project. What should you do?', 'intermediate', 'Chatbots can make mistakes or invent things, so their answers need checking too.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('eb98e62c-5704-5834-b341-3bbcf82bcdb1', 'e1d39f3a-3dd6-571a-9c36-3b63f02e818b', 'Use it without checking, because AI is always right', false, 1),
  ('d6f69d2c-a7d1-528c-8558-ef9062353ace', 'e1d39f3a-3dd6-571a-9c36-3b63f02e818b', 'Change it to sound better', false, 2),
  ('5a96280f-0d6f-5528-a77d-f7698b500946', 'e1d39f3a-3dd6-571a-9c36-3b63f02e818b', 'Check it with a reliable source', true, 3),
  ('51e9055b-c212-59e5-ba76-b5477db1e8f9', 'e1d39f3a-3dd6-571a-9c36-3b63f02e818b', 'Ask the chatbot to promise it is true', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('03687acb-c4ef-57e6-a3f1-d4b72d043c88', '942d376f-d0dd-5e30-9282-5c1b8a8bdeef', 'You are not sure whether a post is true. What is the best thing to do?', 'intermediate', 'Pausing stops false information spreading, and an adult can help you check.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('d4457d46-fa8f-5907-afd1-bfbe73edb791', '03687acb-c4ef-57e6-a3f1-d4b72d043c88', 'Share it and see what happens', false, 1),
  ('b9a92935-620c-5932-ae28-f63403e509cc', '03687acb-c4ef-57e6-a3f1-d4b72d043c88', 'Argue in the comments', false, 2),
  ('c7618527-cf8b-5887-b01d-3130c7f21d28', '03687acb-c4ef-57e6-a3f1-d4b72d043c88', 'Send a screenshot to everyone', false, 3),
  ('40541b2e-3246-53a8-8482-94d0c87485f3', '03687acb-c4ef-57e6-a3f1-d4b72d043c88', 'Pause, do not share, and ask a trusted adult', true, 4)
on conflict (id) do nothing;

-- Lesson: Why Should We Never Share Personal Information With AI?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  'd55685ec-a11c-59aa-8843-a1dd4c5e2be7',
  'f2152ad4-c5e0-5e29-b37d-a6bde94fd81f',
  'Why Should We Never Share Personal Information With AI?',
  'why-never-share-personal-information-with-ai',
  'Chatbots can feel friendly, but they are not the place for private details. Learn what personal information is and how to protect it.',
  '8-12',
  'beginner',
  9,
  1,
  array['Identify what counts as personal information.', 'Explain what can happen to information typed into an AI tool.', 'Practise safe ways to ask AI for help.']::text[],
  'Chatting to an AI can feel like talking to a helpful friend. It answers politely, never gets bored and is always there. So it is easy to forget an important fact: an AI chatbot is a computer service run by a company, and what you type does not simply vanish.

Depending on the tool, your messages may be stored, read by people who work on the service, or used to help train future versions of the AI. Once information is out, you cannot easily pull it back.

That is why we keep personal information out of AI chats. Personal information is anything that could show who you are or where to find you: your full name, home address, school, phone number, passwords, photos of you, and details about your health or your family.

The good news is that you almost never need those details to get help. Instead of “I am Mia Carter from Oak Road School and I need help with fractions”, you can simply write “Can you explain fractions with an example?”

Many AI tools are also made for adults and have age rules, so always use them with a trusted grown-up''s permission.

Here is a simple test: would I be happy for this to be read out in assembly? If not, do not type it.',
  '[{"term":"Personal information","definition":"Details that could identify you or help someone find you, such as your full name, address or school."},{"term":"Privacy","definition":"Your right to keep information about yourself safe and to choose who sees it."},{"term":"Password","definition":"A secret word or phrase that protects your accounts."},{"term":"Data storage","definition":"Keeping information saved on computers."}]'::jsonb,
  array['Personal information can identify you or show where to find you.', 'What you type into an AI tool may be stored or seen by others.', 'You can get great help from AI without sharing private details.']::text[],
  array['Keeping details private protects you and your family.', 'Good privacy habits keep you safer everywhere online.', 'You can still ask AI for help with ideas and explanations.']::text[],
  array['Once information has been shared, it is very hard to take back.', 'You cannot see exactly how a company stores or uses your messages.', 'AI cannot keep a secret the way a trusted person can.']::text[],
  array['Never type your full name, address, school, phone number or passwords into an AI tool.', 'Never upload photos of yourself or other people without a trusted adult''s permission.', 'If an AI tool or anyone online asks for personal information, stop and tell a trusted adult.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('3f167d8e-899a-52e0-8636-b37fdfad84fa', 'd55685ec-a11c-59aa-8843-a1dd4c5e2be7', 'Quiz: Why Should We Never Share Personal Information With AI?', 'Five questions about keeping your information safe.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('265385e9-7fde-52f6-91e5-983726ddf145', '3f167d8e-899a-52e0-8636-b37fdfad84fa', 'Which of these is personal information?', 'beginner', 'Your address could help someone find you, so it is personal information.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('cd7dcdf0-9180-5086-b8fd-8a3f8f165b81', '265385e9-7fde-52f6-91e5-983726ddf145', 'Your favourite colour', false, 1),
  ('977e48a3-869b-5107-8465-5a55b6327f21', '265385e9-7fde-52f6-91e5-983726ddf145', 'The capital of France', false, 2),
  ('8831a810-0409-5804-a355-d34f7d5315c1', '265385e9-7fde-52f6-91e5-983726ddf145', 'Your home address', true, 3),
  ('fd7ca7e1-2b23-584e-bbd2-7d9c60445b5f', '265385e9-7fde-52f6-91e5-983726ddf145', 'The number of days in a week', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('8dc08122-b060-5479-94c8-2fcebbf9445a', '3f167d8e-899a-52e0-8636-b37fdfad84fa', 'What can happen to messages typed into an AI tool?', 'beginner', 'Messages can be saved, reviewed or used for training, depending on the tool.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('91c938e1-06f9-54be-878f-c31ce2f832ac', '8dc08122-b060-5479-94c8-2fcebbf9445a', 'They may be stored and used by the company', true, 1),
  ('446a0b6d-53a0-5c1e-a96d-3bbf7123a062', '8dc08122-b060-5479-94c8-2fcebbf9445a', 'They instantly vanish for ever', false, 2),
  ('ab0d2efd-6660-532a-9c24-ddd4ef5b3dd6', '8dc08122-b060-5479-94c8-2fcebbf9445a', 'They turn into paper letters', false, 3),
  ('1e4cdfba-1540-50eb-84a4-b38e98f3a920', '8dc08122-b060-5479-94c8-2fcebbf9445a', 'Nothing ever happens to them', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('784e1ae7-c1b1-5b5f-9caa-dbbbfe9f9f00', '3f167d8e-899a-52e0-8636-b37fdfad84fa', 'Which is the safest way to ask an AI for help?', 'beginner', 'You can get the help you need without giving any private details.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('62ca25bf-1127-5022-a0de-f574844d036f', '784e1ae7-c1b1-5b5f-9caa-dbbbfe9f9f00', '“I''m Sam Lee of 4 Hill Street. Help me with maths.”', false, 1),
  ('5944297e-9b8f-5a40-8713-3ff882cfc815', '784e1ae7-c1b1-5b5f-9caa-dbbbfe9f9f00', '“My password is tiger123. Is it a good one?”', false, 2),
  ('b28d4134-c68f-5ba9-b9ac-bdf9184b99cf', '784e1ae7-c1b1-5b5f-9caa-dbbbfe9f9f00', '“Here is a photo of my school uniform.”', false, 3),
  ('85b9db2f-0bd5-569c-ad60-0737f1861846', '784e1ae7-c1b1-5b5f-9caa-dbbbfe9f9f00', '“Can you explain fractions with an example?”', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('5abcce6c-f236-5ce0-9259-55ade8cace7f', '3f167d8e-899a-52e0-8636-b37fdfad84fa', 'An AI chatbot asks which school you go to. What should you do?', 'beginner', 'Your school is personal information. Keep it private and tell an adult that you were asked.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('9564f9d7-72e2-5265-ad4c-6e35b07f1254', '5abcce6c-f236-5ce0-9259-55ade8cace7f', 'Tell it, because it is only a robot', false, 1),
  ('3c0839a6-9d36-5188-82fa-14c818f59315', '5abcce6c-f236-5ce0-9259-55ade8cace7f', 'Not tell it, and let a trusted adult know', true, 2),
  ('a3d1804f-496f-5700-928c-7d193d057a93', '5abcce6c-f236-5ce0-9259-55ade8cace7f', 'Tell it your friend''s school instead', false, 3),
  ('e79adad3-b68f-510f-b017-32f25cca68b2', '5abcce6c-f236-5ce0-9259-55ade8cace7f', 'Give it your teacher''s phone number', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('b87b1a05-b57b-594b-93ea-711c50246086', '3f167d8e-899a-52e0-8636-b37fdfad84fa', 'Why is it hard to “take back” information once it is shared?', 'beginner', 'Once information is saved on someone else''s computers, you no longer control it.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('e279d507-95bf-551c-b2ad-ab8a255be34e', 'b87b1a05-b57b-594b-93ea-711c50246086', 'Because keyboards are slow', false, 1),
  ('fe860ef0-cfe6-536b-b98c-6f17adb05189', 'b87b1a05-b57b-594b-93ea-711c50246086', 'Because the internet closes at night', false, 2),
  ('6de08680-e383-5471-aded-806c3fafb7c3', 'b87b1a05-b57b-594b-93ea-711c50246086', 'Because copies may be stored where you cannot reach them', true, 3),
  ('71cec8fd-c1df-5d9d-a1c8-b0eaa8f73448', 'b87b1a05-b57b-594b-93ea-711c50246086', 'It is easy. Just press undo', false, 4)
on conflict (id) do nothing;

-- Lesson: Can AI Make Mistakes?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  '24e79f12-93aa-5466-9f01-3f377e41fff4',
  'f2152ad4-c5e0-5e29-b37d-a6bde94fd81f',
  'Can AI Make Mistakes?',
  'can-ai-make-mistakes',
  'AI can be very useful and very wrong. Explore why AI makes mistakes and how to double-check its answers.',
  '8-12',
  'beginner',
  9,
  2,
  array['Explain why AI systems make mistakes.', 'Describe what bias means, with an example.', 'Use simple checks before trusting an AI''s answer.']::text[],
  'Calculators do not make mistakes, so surely AI does not either? Actually, AI makes mistakes all the time, and knowing why will make you a much smarter user.

Reason one: AI learns from data, and data can be wrong, out of date or incomplete. If an AI learned about animals only from pictures taken in the daytime, it might struggle to recognise an owl at night.

Reason two: AI predicts; it does not know. A chatbot produces the words that seem most likely to fit. Usually that works. Sometimes it produces something that sounds perfect but is completely made up, such as an invented fact, book or quotation. People sometimes call this a hallucination.

Reason three: bias. If the examples used in training are unfair or leave some people out, the AI can be unfair too. For instance, a voice assistant trained mostly on one accent may not understand other accents as well.

And AI rarely says “I am not sure.” It often sounds just as confident when it is wrong as when it is right.

So what do smart explorers do? They treat an AI answer as a starting point, not the final word. They check important facts in another reliable source, they ask “Does this make sense?”, and for anything that really matters, such as health or safety, they ask a trusted adult.',
  '[{"term":"Bias","definition":"When an AI treats some people or things unfairly because of the examples it learned from."},{"term":"Hallucination","definition":"When an AI confidently gives information that is made up or wrong."},{"term":"Accuracy","definition":"How often something is correct."},{"term":"Verify","definition":"To check that something is true."}]'::jsonb,
  array['AI makes mistakes because it predicts from imperfect data.', 'AI can sound confident even when it is wrong.', 'Check important answers with a reliable source or a trusted adult.']::text[],
  array['Knowing that AI can be wrong helps you use it wisely.', 'People can find and fix AI mistakes when they check its work.', 'Better and fairer data can make AI more accurate.']::text[],
  array['AI may not tell you when it is unsure.', 'It can repeat unfairness that was hidden in its training data.', 'It may not know about recent events.']::text[],
  array['Never rely on AI alone for health, safety or emergency advice. Ask a trusted adult.', 'Double-check AI answers before using them in schoolwork.', 'If an AI says something unkind or unfair, tell a trusted adult.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('a4b7c130-3534-5dab-9b72-83edcbf86542', '24e79f12-93aa-5466-9f01-3f377e41fff4', 'Quiz: Can AI Make Mistakes?', 'Five questions about AI mistakes and how to catch them.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('b15ccc28-1424-5662-8d08-c2af250ef830', 'a4b7c130-3534-5dab-9b72-83edcbf86542', 'Why can AI make mistakes?', 'beginner', 'AI can only be as good as the examples it learned from.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('7ac9ee02-eae7-57aa-88fb-561f853a637a', 'b15ccc28-1424-5662-8d08-c2af250ef830', 'Because it is being naughty', false, 1),
  ('cadd331f-26d6-5ee3-8ef5-9ce4059956cb', 'b15ccc28-1424-5662-8d08-c2af250ef830', 'Because it learns from data that can be wrong or incomplete', true, 2),
  ('b367f7d7-8cef-5d52-94e6-d9ae9fff2b26', 'b15ccc28-1424-5662-8d08-c2af250ef830', 'Because it gets sleepy', false, 3),
  ('2b915351-c223-542a-b629-80d399b11fcf', 'b15ccc28-1424-5662-8d08-c2af250ef830', 'Because the screen is dirty', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('83ef8819-852b-5652-af45-728a02fd6232', 'a4b7c130-3534-5dab-9b72-83edcbf86542', 'What is an AI “hallucination”?', 'beginner', 'A hallucination is an answer that sounds right but is invented or incorrect.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('eb5ccc71-3188-5aec-886f-491db888919e', '83ef8819-852b-5652-af45-728a02fd6232', 'A dream that a robot has', false, 1),
  ('f513c6bb-0453-5ab7-844c-bf79850cb787', '83ef8819-852b-5652-af45-728a02fd6232', 'A screen saver', false, 2),
  ('db205d16-7ed9-515c-9c93-a4f02a0dc38d', '83ef8819-852b-5652-af45-728a02fd6232', 'A kind of computer virus', false, 3),
  ('c9dc9516-3f39-5af4-9fe3-bbaba493c94d', '83ef8819-852b-5652-af45-728a02fd6232', 'When an AI confidently gives made-up or wrong information', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('6b7d65a6-43f8-50aa-a02e-c110c9c2f37d', 'a4b7c130-3534-5dab-9b72-83edcbf86542', 'A voice assistant understands some accents better than others because of its training examples. What is this an example of?', 'beginner', 'When training examples leave some people out, the AI works less well for them. That is bias.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('615b47a7-8d0f-5718-b5db-0bc8e5ce3d08', '6b7d65a6-43f8-50aa-a02e-c110c9c2f37d', 'Bias', true, 1),
  ('89b976e3-7ad2-5d75-86d5-937a6157c60a', '6b7d65a6-43f8-50aa-a02e-c110c9c2f37d', 'Magic', false, 2),
  ('9ddb6636-a9a2-54ce-a1f2-c933e60e0082', '6b7d65a6-43f8-50aa-a02e-c110c9c2f37d', 'A flat battery', false, 3),
  ('340cd7a7-8943-5c56-a0bc-9eba67b57894', '6b7d65a6-43f8-50aa-a02e-c110c9c2f37d', 'Good manners', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('dc624099-5a04-526f-a676-4e58eb4ac4ce', 'a4b7c130-3534-5dab-9b72-83edcbf86542', 'An AI answer sounds very confident. Does that mean it is right?', 'beginner', 'Confidence is not proof. AI sounds sure of itself either way.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('2d62f29f-2879-5f22-aaf9-daaca26810c4', 'dc624099-5a04-526f-a676-4e58eb4ac4ce', 'Yes, always', false, 1),
  ('ebb84603-c7b2-5762-af4e-d5fe00130d7c', 'dc624099-5a04-526f-a676-4e58eb4ac4ce', 'Only if it uses long words', false, 2),
  ('d4e9ffce-58f7-5e42-a505-26a0a24012e8', 'dc624099-5a04-526f-a676-4e58eb4ac4ce', 'No. AI can sound confident even when it is wrong', true, 3),
  ('595ae47b-3f0a-594c-b8cd-bea3d551d4bb', 'dc624099-5a04-526f-a676-4e58eb4ac4ce', 'Only in the morning', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('071e54a1-ab58-5968-81f2-88a9db3407ab', 'a4b7c130-3534-5dab-9b72-83edcbf86542', 'What should you do with an important fact that an AI gives you?', 'beginner', 'Treat an AI answer as a starting point and verify anything that matters.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('fd5835f3-bccf-5721-9ba7-dd6605fe21ad', '071e54a1-ab58-5968-81f2-88a9db3407ab', 'Believe it straight away', false, 1),
  ('e438a26c-4a37-586d-9d0d-1bbad4300f38', '071e54a1-ab58-5968-81f2-88a9db3407ab', 'Check it with another reliable source', true, 2),
  ('2bd10965-299e-54b3-9cff-165c09fc48f5', '071e54a1-ab58-5968-81f2-88a9db3407ab', 'Tell everyone at once', false, 3),
  ('5388c2eb-0534-577e-9b3d-d520c80c8e9d', '071e54a1-ab58-5968-81f2-88a9db3407ab', 'Never use facts again', false, 4)
on conflict (id) do nothing;

-- Lesson: What Are AI Agents?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  '1dcf8beb-6100-5d5f-a29a-d181f6d09945',
  '3b81b795-73cc-532a-a63b-d6770b08ad34',
  'What Are AI Agents?',
  'what-are-ai-agents',
  'Some AI does more than answer questions: it carries out tasks step by step. Meet AI agents and learn why people must stay in charge.',
  '8-12',
  'intermediate',
  10,
  1,
  array['Explain how an AI agent differs from a chatbot.', 'Describe the steps an agent follows to complete a task.', 'Explain why humans need to supervise AI agents.']::text[],
  'Most AI you have met so far answers questions: you ask, it replies. An AI agent goes a step further. You give it a goal, and it works out the steps and carries them out.

Imagine asking, “Plan a picnic for Saturday.” A chatbot might write a nice list. An agent could check the weather forecast, look at the family calendar, find a park nearby, write a shopping list and set a reminder, using different tools along the way, a bit like a helpful assistant.

To do this, an agent repeats a loop. First it plans: what needs doing? Then it acts, using a tool such as a search engine or a calendar. Then it checks: did that work? If not, it tries another way. It keeps going until the goal is reached or it needs to ask for help.

Agents could save people lots of time on boring jobs. But because agents take actions, mistakes matter more. A chatbot''s wrong answer is just words. An agent''s wrong action might send the wrong message or buy the wrong thing.

That is why good agents are built with limits. They only get the permissions they really need, and they ask a human before doing anything important. People choose the goals, set the rules and check the results. The human stays in charge.',
  '[{"term":"AI agent","definition":"An AI system that can plan and carry out steps to reach a goal, often using other tools."},{"term":"Goal","definition":"The result you want to achieve."},{"term":"Tool","definition":"A program an agent can use, such as a search engine, calendar or calculator."},{"term":"Supervise","definition":"To watch over something and step in when needed."}]'::jsonb,
  array['An AI agent plans and takes actions to reach a goal.', 'Agents work in a loop: plan, act, check.', 'People must set the rules and stay in charge.']::text[],
  array['Can complete tasks with several steps and save people time.', 'Can use several tools together.', 'Can take over repetitive jobs so that people can focus on other things.']::text[],
  array['A mistake in one step can cause problems in later steps.', 'May misunderstand what a person really wanted.', 'Needs careful limits and human checking.']::text[],
  array['Never give an AI agent passwords, payment details or permission to act for you. That is for adults to decide.', 'Important actions, such as spending money or sending messages, should always be approved by a person.', 'If an AI tool starts doing something you did not expect, stop and tell a trusted adult.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('919c2a06-024c-511c-bc3d-5934053726e7', '1dcf8beb-6100-5d5f-a29a-d181f6d09945', 'Quiz: What Are AI Agents?', 'Five questions about AI that takes action.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('0ecfc63a-da99-5548-8283-a15121f4c8a9', '919c2a06-024c-511c-bc3d-5934053726e7', 'What is the main difference between a chatbot and an AI agent?', 'intermediate', 'A chatbot replies with words. An agent works out the steps and takes actions.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('cf223214-4fef-5579-ae75-5dff45286e77', '0ecfc63a-da99-5548-8283-a15121f4c8a9', 'An agent is always a robot with legs', false, 1),
  ('ba9cc3e6-b444-559d-9a7a-750f4c859154', '0ecfc63a-da99-5548-8283-a15121f4c8a9', 'A chatbot is more expensive', false, 2),
  ('79faacfc-00b0-55f9-b5c3-cd7444492f28', '0ecfc63a-da99-5548-8283-a15121f4c8a9', 'An agent can plan and carry out steps to reach a goal', true, 3),
  ('7ba05720-769e-519c-9be7-797c198b0fb3', '0ecfc63a-da99-5548-8283-a15121f4c8a9', 'There is no difference', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('b691cd60-e6a7-588a-87d0-5535a8940f4a', '919c2a06-024c-511c-bc3d-5934053726e7', 'Which loop does an AI agent follow?', 'intermediate', 'An agent plans a step, carries it out, checks the result and then repeats.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('0ade963e-76b2-5eac-a1f3-6570fecb4c64', 'b691cd60-e6a7-588a-87d0-5535a8940f4a', 'Plan, act, check', true, 1),
  ('81c7edc8-9cfe-5bac-a38e-c26c33a04173', 'b691cd60-e6a7-588a-87d0-5535a8940f4a', 'Eat, sleep, repeat', false, 2),
  ('08ebf32b-60c9-5241-8bcf-912ae1f3c823', 'b691cd60-e6a7-588a-87d0-5535a8940f4a', 'Stop, drop, roll', false, 3),
  ('b53aff9a-45f5-5c9a-9e7a-8d653d3e56ec', 'b691cd60-e6a7-588a-87d0-5535a8940f4a', 'Copy, paste, print', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('9782be76-7a7b-548e-a4fd-1a4edc532409', '919c2a06-024c-511c-bc3d-5934053726e7', 'Why do mistakes matter more with agents than with chatbots?', 'intermediate', 'A wrong action, such as sending a message, has real effects. A wrong sentence can simply be ignored.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('0aed456d-e280-59df-9ee7-4dc1fd079230', '9782be76-7a7b-548e-a4fd-1a4edc532409', 'Because agents are louder', false, 1),
  ('7967ad2e-39ba-58de-9708-be62829615f5', '9782be76-7a7b-548e-a4fd-1a4edc532409', 'Because chatbots never make mistakes', false, 2),
  ('54865ca6-5e92-5115-a491-fdb4df0075fb', '9782be76-7a7b-548e-a4fd-1a4edc532409', 'Because agents use more colours', false, 3),
  ('4559bc01-ab76-5c2d-beb7-3fc68a1e34dd', '9782be76-7a7b-548e-a4fd-1a4edc532409', 'Because agents take actions, not just write words', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('c98f46cc-5011-57f0-b672-893f152d9110', '919c2a06-024c-511c-bc3d-5934053726e7', 'What should a well-designed agent do before something important, such as spending money?', 'intermediate', 'Important actions should be approved by a person first.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('4ef62066-7765-5a61-8861-4a01f9ee8f66', 'c98f46cc-5011-57f0-b672-893f152d9110', 'Do it quickly', false, 1),
  ('59e436d3-54b2-59cb-84e8-180d9058774b', 'c98f46cc-5011-57f0-b672-893f152d9110', 'Ask a human for approval', true, 2),
  ('19e8cadb-15b7-5cd6-a110-f236dec15b82', 'c98f46cc-5011-57f0-b672-893f152d9110', 'Hide it', false, 3),
  ('58e7b4a9-273b-50f0-a09d-0e21a521b68b', 'c98f46cc-5011-57f0-b672-893f152d9110', 'Do it twice to be sure', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('1ea51f17-8be2-559b-914d-ad0a5cbc88dc', '919c2a06-024c-511c-bc3d-5934053726e7', 'Who should stay in charge when an AI agent is working?', 'intermediate', 'People set the goals and the rules, and they check the results.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('1a0fb883-0ee0-5462-b5db-6c1b9295a000', '1ea51f17-8be2-559b-914d-ad0a5cbc88dc', 'The agent', false, 1),
  ('65ecf443-b956-5454-b8f5-4e32b97f5e69', '1ea51f17-8be2-559b-914d-ad0a5cbc88dc', 'Nobody', false, 2),
  ('6a826c5c-cefb-5591-8c9f-38557c11c87b', '1ea51f17-8be2-559b-914d-ad0a5cbc88dc', 'People', true, 3),
  ('26981031-0f2b-5c24-a6ee-f854a5d6918f', '1ea51f17-8be2-559b-914d-ad0a5cbc88dc', 'The fastest computer', false, 4)
on conflict (id) do nothing;

-- Lesson: How Do Robots Use AI?
insert into public.lessons (
  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,
  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,
  limitations, safety_notes, is_sample, status, published_at
)
values (
  '04a44ec2-c22f-59dc-b15e-3a5156f6c89e',
  '3b81b795-73cc-532a-a63b-d6770b08ad34',
  'How Do Robots Use AI?',
  'how-do-robots-use-ai',
  'Robots sense, think and act. Find out how AI helps robots understand the world around them.',
  '8-12',
  'beginner',
  9,
  2,
  array['Explain the difference between a robot and AI.', 'Describe the sense, think, act cycle.', 'Give examples of jobs robots do and of their limits.']::text[],
  'People often mix up robots and AI, but they are not the same thing. A robot is a machine with a body that can move and do things in the real world. AI is software, which means a kind of computer program. Some robots use AI as their “brain” and some do not: a simple robot arm in a factory may just repeat the same movement all day.

A robot that uses AI works in a cycle with three parts: sense, think, act.

Sense. The robot collects information using sensors. Cameras work a bit like eyes, microphones a bit like ears, and touch sensors tell it when it has bumped into something.

Think. This is where AI comes in. It looks for patterns in the sensor data: that shape is a chair, that sound is a spoken command, that gap is wide enough to drive through. Then it decides what to do.

Act. Motors move wheels, arms or grippers to carry out the decision. Then the cycle starts again, many times every second.

A robot vacuum cleaner is a good example. It senses walls and furniture, builds a map of the room and plans a path to clean the floor.

Robots are helpful in places that are dull, dirty or dangerous for people: warehouses, deep oceans, even Mars. But the real world is messy, and things that are easy for you, such as tidying a bedroom or folding a jumper, are still very hard for robots.',
  '[{"term":"Robot","definition":"A machine that can sense its surroundings and move or do tasks in the real world."},{"term":"Sensor","definition":"A part that collects information, like a camera, microphone or touch sensor."},{"term":"Motor","definition":"A part that makes a robot move."},{"term":"Software","definition":"The programs that tell a computer or robot what to do."}]'::jsonb,
  array['A robot is a machine with a body; AI is software that can act as its brain.', 'AI robots repeat a cycle: sense, think, act.', 'Robots are useful but still struggle with many everyday tasks.']::text[],
  array['Can work in places that are dangerous for people.', 'Can do repetitive jobs accurately for a long time.', 'Can help explore places humans cannot easily reach, like other planets.']::text[],
  array['Struggle with messy, unexpected situations.', 'Find many everyday tasks, like folding clothes, very difficult.', 'Can only sense what their sensors are able to detect.']::text[],
  array['Keep fingers, hair and loose clothing away from moving robot parts.', 'Robots and smart toys may have cameras and microphones. Ask a trusted adult about privacy settings.', 'Follow the instructions and use robots only in the way they were designed to be used.']::text[],
  true,
  'published',
  now()
)
on conflict (id) do nothing;

insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)
values ('fd4773f1-1d4b-532c-b0e9-1b127bb04dd2', '04a44ec2-c22f-59dc-b15e-3a5156f6c89e', 'Quiz: How Do Robots Use AI?', 'Five questions about robots and their AI brains.', 60, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('f6409b38-0a18-536f-82ff-455f08aec4d1', 'fd4773f1-1d4b-532c-b0e9-1b127bb04dd2', 'What is the difference between a robot and AI?', 'beginner', 'A robot is hardware that moves in the real world. AI is software that can help it decide what to do.', 1)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('10479a13-e122-5645-90ae-076127c63090', 'f6409b38-0a18-536f-82ff-455f08aec4d1', 'They are exactly the same', false, 1),
  ('9e1eecd2-8c76-5fe9-be4a-07bc38bedda1', 'f6409b38-0a18-536f-82ff-455f08aec4d1', 'A robot is a machine with a body; AI is software that can act as its brain', true, 2),
  ('c4a26862-c2ad-5db1-afeb-8afe28bf5ba5', 'f6409b38-0a18-536f-82ff-455f08aec4d1', 'AI is made of metal', false, 3),
  ('284a0b2c-c9a2-5130-942f-c5b739f8f9fd', 'f6409b38-0a18-536f-82ff-455f08aec4d1', 'Robots are always alive', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('05d43b0c-6f30-5031-a9df-2fc0d9469706', 'fd4773f1-1d4b-532c-b0e9-1b127bb04dd2', 'What are the three parts of the cycle an AI robot follows?', 'beginner', 'The robot senses its surroundings, thinks about what to do, and then acts.', 2)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('44e4e7c7-dea2-5f29-98ce-82b1c075f2ed', '05d43b0c-6f30-5031-a9df-2fc0d9469706', 'Run, jump, hide', false, 1),
  ('fa4a608e-182a-5a2c-b751-cbccdc59c5b3', '05d43b0c-6f30-5031-a9df-2fc0d9469706', 'Read, write, draw', false, 2),
  ('b3a0d2f6-4203-5317-bb16-ecafa7f302f9', '05d43b0c-6f30-5031-a9df-2fc0d9469706', 'Start, stop, sleep', false, 3),
  ('0b21ec26-221b-51ea-9d8e-18232d79d459', '05d43b0c-6f30-5031-a9df-2fc0d9469706', 'Sense, think, act', true, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('9de29233-edaa-53ad-a3b6-d561bc632598', 'fd4773f1-1d4b-532c-b0e9-1b127bb04dd2', 'Which part of a robot collects information about its surroundings?', 'beginner', 'Sensors such as cameras and microphones gather information for the robot.', 3)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('9e6fbfc9-202e-56e0-aae2-6a0751d7d043', '9de29233-edaa-53ad-a3b6-d561bc632598', 'Sensors', true, 1),
  ('57def597-dd34-5329-a822-dd4efc8f6676', '9de29233-edaa-53ad-a3b6-d561bc632598', 'Paint', false, 2),
  ('f59ce96f-3b1f-5505-82b1-2b75d5c7bbc3', '9de29233-edaa-53ad-a3b6-d561bc632598', 'The wheels only', false, 3),
  ('3c08e358-a914-5ba8-959c-a27c6c5b28ea', '9de29233-edaa-53ad-a3b6-d561bc632598', 'The on/off sticker', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('dd13ca1c-3020-524a-a714-16af347e64ec', 'fd4773f1-1d4b-532c-b0e9-1b127bb04dd2', 'Why are robots useful on Mars or in the deep ocean?', 'beginner', 'Robots can go where it would be unsafe or impossible to send people.', 4)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('4450b71f-a94b-59c4-aaf5-4e7c1b74ccab', 'dd13ca1c-3020-524a-a714-16af347e64ec', 'They enjoy holidays', false, 1),
  ('1aadaa09-256b-52ab-9367-a66825bc3a73', 'dd13ca1c-3020-524a-a714-16af347e64ec', 'They need a bath', false, 2),
  ('296476d4-f479-5c38-8e66-1f3554f0d5da', 'dd13ca1c-3020-524a-a714-16af347e64ec', 'Those places are dangerous or hard for people to reach', true, 3),
  ('bce03745-673f-56a7-977b-e91d309a98cf', 'dd13ca1c-3020-524a-a714-16af347e64ec', 'Robots get bored at home', false, 4)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)
values ('fb4eedcc-796b-5c06-969e-45c691840bc3', 'fd4773f1-1d4b-532c-b0e9-1b127bb04dd2', 'Which task is still very hard for most robots?', 'beginner', 'Soft, messy, unpredictable objects are much harder for robots than for people.', 5)
on conflict (id) do nothing;
insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)
values
  ('9a80adcf-2f0c-5a7a-ae83-47df10d34977', 'fb4eedcc-796b-5c06-969e-45c691840bc3', 'Repeating one movement in a factory', false, 1),
  ('11a4ba78-c30c-534c-abae-0ff70e49480c', 'fb4eedcc-796b-5c06-969e-45c691840bc3', 'Adding up numbers', false, 2),
  ('5bbf8325-b323-5a03-925f-ea0a1d03baa6', 'fb4eedcc-796b-5c06-969e-45c691840bc3', 'Following a painted line on the floor', false, 3),
  ('7ce780f0-265c-5f48-be59-8cd24b1c07f3', 'fb4eedcc-796b-5c06-969e-45c691840bc3', 'Folding a pile of mixed laundry neatly', true, 4)
on conflict (id) do nothing;

-- Achievements
insert into public.achievements (id, title, description, badge_key, points_threshold, is_active)
values ('5602206f-94ab-5200-ad6f-9b585593453a', 'First Steps', 'Earn your first 10 XP.', 'first-steps', 10, true)
on conflict (id) do nothing;
insert into public.achievements (id, title, description, badge_key, points_threshold, is_active)
values ('8c37afba-5e5e-500a-90d5-16f30cb13952', 'Curious Mind', 'Reach 50 XP by finishing lessons and quizzes.', 'curious-mind', 50, true)
on conflict (id) do nothing;
insert into public.achievements (id, title, description, badge_key, points_threshold, is_active)
values ('7f91753a-3cee-590b-9539-7a8bd7ba9f60', 'Pattern Spotter', 'Reach 120 XP. You are spotting how AI works!', 'pattern-spotter', 120, true)
on conflict (id) do nothing;
insert into public.achievements (id, title, description, badge_key, points_threshold, is_active)
values ('0eca1431-bfc9-5ca9-a218-5623fcee44c8', 'Fact Detective', 'Reach 250 XP. You check before you believe.', 'fact-detective', 250, true)
on conflict (id) do nothing;
insert into public.achievements (id, title, description, badge_key, points_threshold, is_active)
values ('13f89fad-2fd2-55ce-a35d-913027ae5b2b', 'Safety Star', 'Reach 400 XP. You know how to use AI safely.', 'safety-star', 400, true)
on conflict (id) do nothing;
insert into public.achievements (id, title, description, badge_key, points_threshold, is_active)
values ('fad135d0-b9b7-580d-a22f-7e25d7ba95d0', 'Future Ready', 'Reach 650 XP. You are ready for what comes next.', 'future-ready', 650, true)
on conflict (id) do nothing;

-- First content version for every sample lesson that does not have one yet.
do $$
declare
  v_lesson_id uuid;
begin
  for v_lesson_id in
    select l.id
    from public.lessons l
    where l.is_sample
      and not exists (select 1 from public.content_versions v where v.lesson_id = l.id)
  loop
    perform app_private.snapshot_lesson(v_lesson_id, null);
  end loop;
end;
$$;
