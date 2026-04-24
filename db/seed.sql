-- SnippetMate seed data — 16 real snippets I collected while building the app.
-- Load order: schema.sql first, then this file, as snippetmate_user:
--   mysql -u snippetmate_user -p snippetmate < db/seed.sql
-- TRUNCATE makes this safe to re-run; it wipes existing rows first.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE snippet_tags;
TRUNCATE TABLE snippets;
TRUNCATE TABLE tags;

SET FOREIGN_KEY_CHECKS = 1;

-- Tags (21 rows)
INSERT INTO tags (id, name) VALUES
(1, 'acquisition'),
(2, 'AI'),
(3, 'Amazon'),
(4, 'Anthropic'),
(5, 'banking'),
(6, 'China'),
(7, 'cybersecurity'),
(8, 'Data centre'),
(9, 'employment'),
(10, 'Europe'),
(11, 'finance'),
(12, 'Financial Times'),
(13, 'Germany'),
(14, 'investment'),
(15, 'Meta'),
(16, 'Microsoft'),
(17, 'open source'),
(18, 'OpenAI'),
(19, 'policy'),
(20, 'UK'),
(21, 'US');

-- Snippets (16 rows)
INSERT INTO snippets (id, title, content, source_url, created_at, updated_at) VALUES
(1, 'Data centre delays threaten to choke AI expansion',
 'Almost 40% of such builds in US risk hold-ups, including projects tied to Microsoft and OpenAI',
 'https://www.ft.com/content/f2bae708-f5c3-49b0-99c0-e4a11552427b',
 '2026-04-21 07:25:41', '2026-04-21 07:25:41'),

(2, 'China shock 2.0 should Europe welcome Chinese investment',
 'Impelled by furious competition, hefty subsidies and sheer scale, the country''s companies are cutting a swath through the world''s most advanced industries',
 'https://www.ft.com/content/7d51a630-a3de-4cc7-9f5f-0f3e7f0d305a',
 '2026-04-21 07:25:41', '2026-04-21 07:25:41'),

(3, 'Anthropic, Amazon Tighten Bond in $5 Billion Investment and Computing Deal',
 'Amazon will invest as much as $25 billion in the AI company, which will secure up to 5 gigawatts in badly needed computing power in the pact',
 'https://www.wsj.com/tech/ai/anthropic-amazon-tighten-bond-in-5-billion-investment-and-computing-deal-b9d8e513',
 '2026-04-21 07:25:41', '2026-04-21 07:25:41'),

(4, 'You''re About to See a Lot of Critical Software Updates. Don''t Ignore Them',
 'Anthropic''s newest, as-yet-unreleased AI model is a hacker''s dream, so here''s the cybersecurity advice you need to start taking seriously right now',
 'https://www.wsj.com/tech/personal-tech/anthropic-mythos-security-software-updates-573cc9b3',
 '2026-04-21 07:25:41', '2026-04-21 07:25:41'),

(5, 'FAA grounds Blue Origin''s New Glenn after satellite failure',
 'Amazon''s Kuiper ambitions take a hit: the FAA halted New Glenn operations pending an investigation into a failed satellite deployment on Sunday. Amazon may need to rely more on SpaceX launches to hit its FCC deadline.',
 'https://www.ft.com/content/cbc55056-91f2-4b69-af26-fd749fbf15ed',
 '2026-04-23 03:13:26', '2026-04-23 03:13:26'),

(6, 'Anthropic''s Mythos model sets off global alarms',
 'Anthropic''s new AI model, Mythos, can reportedly find and exploit flaws in software running banks, power grids, and governments. Access has been shared so far only with the US and UK, triggering emergency responses from central banks worldwide.',
 'https://www.nytimes.com/2026/04/22/technology/anthropics-mythos-ai.html',
 '2026-04-23 03:14:04', '2026-04-23 03:14:04'),

(7, 'SpaceX strikes $60 billion deal with Cursor',
 'SpaceX has the option to acquire AI coding startup Cursor for $60 billion later this year, ahead of a potential IPO in June. Musk continues pivoting the rocket company toward AI and orbital data centers.',
 'https://www.nytimes.com/2026/04/21/business/spacex-cursor-deal.html',
 '2026-04-23 03:14:17', '2026-04-23 03:14:17'),

(8, 'AI is finding bugs that hackers can exploit. Get ready for Bugmageddon.',
 'Anthropic''s Mythos recently uncovered a 27-year-old OpenBSD bug while burning $20,000 of compute over two days. HackerOne reports bug submissions up 76% year on year, with average patch time rising from 160 to 230 days. Security researchers warn the skill barrier for building sophisticated exploits has collapsed.',
 'https://www.wsj.com/tech/ai/ai-is-finding-bugs-that-hackers-can-exploit-get-ready-for-bugmageddon-baaff236',
 '2026-04-23 04:46:32', '2026-04-23 04:46:32'),

(9, 'OpenAI releases new cyber security model to limited group of customers',
 'GPT-5.4-Cyber autonomously finds software flaws for vetted customers in OpenAI''s trusted access programme. The release comes a week after Anthropic''s Mythos, with both labs framing the tools as defensive against AI-enabled attackers.',
 'https://www.ft.com/content/cf3d62e0-1b6c-4e69-b5f7-facaca586dbf',
 '2026-04-23 04:46:48', '2026-04-23 04:46:48'),

(10, 'OpenAI investors question $852bn valuation as strategy shifts',
 'Backers are uneasy about OpenAI''s pivot to enterprise and coding tools while defending ChatGPT''s consumer lead. Anthropic''s annualised revenue reportedly surged from $9bn to $30bn in three months, driven by its coding products. One investor calls OpenAI ''the Netscape of AI''.',
 'https://www.ft.com/content/04ac7917-940b-4606-be5f-9eb895a7d982',
 '2026-04-23 04:47:02', '2026-04-23 04:47:02'),

(11, 'Meta builds AI version of Mark Zuckerberg to interact with staff',
 'Meta is training a photorealistic 3D AI character modelled on Zuckerberg''s voice, mannerisms, and strategic thinking, intended to give employees feedback in his stead. The project sits inside Meta''s Superintelligence Labs push toward ''personal superintelligence''.',
 'https://www.ft.com/content/02107c23-6c7a-4c19-b8e2-b45f4bb9ce5f',
 '2026-04-23 04:47:15', '2026-04-23 04:47:15'),

(12, 'UK in talks with Anthropic over Mythos access for banks',
 'Anthropic is discussing expanded access to its Mythos cyber security AI model with the UK government, with British banks pushing for expedited availability. The model is currently limited to roughly 40 mostly American organisations. Regulators and bankers have raised concerns about its dual-use potential.',
 'https://www.ft.com/content/fe563a8e-e269-4a6b-a577-8ed16a805a7b',
 '2026-04-24 06:44:22', '2026-04-24 06:44:22'),

(13, 'White House accuses China of industrial-scale theft of AI technology',
 'White House science and technology policy director Michael Kratsios accused Chinese entities of running large-scale campaigns to distill US frontier AI systems. The administration plans to share threat intelligence with American labs and explore accountability measures. Beijing called the accusations slander.',
 'https://www.ft.com/content/abde4e1e-c69a-4cc4-ad96-d88308314298',
 '2026-04-24 06:44:40', '2026-04-24 06:44:40'),

(14, 'Inside the German state trying to break free from Microsoft',
 'Schleswig-Holstein is replacing Microsoft products across 44,000 government accounts with open-source alternatives including Thunderbird, Open-Xchange, LibreOffice, and Linux. The push combines cost savings with digital sovereignty concerns. An email migration glitch caused weeks of disruption but the project continues.',
 'https://www.ft.com/content/95bd87c8-a112-49a5-9b80-c280a6bb4283',
 '2026-04-24 06:44:56', '2026-04-24 06:44:56'),

(15, 'Microsoft to offer 7% of US staff voluntary redundancy for the first time',
 'Microsoft will offer voluntary redundancy to about 8,000 long-serving US employees whose age plus years of service totals 70 or more. It is the 51-year-old company''s first such buyout programme. The move coincides with $140bn in planned AI capital spending this fiscal year.',
 'https://www.ft.com/content/f5776fd6-22f3-43d1-806b-9858b64cfd18',
 '2026-04-24 06:45:05', '2026-04-24 06:45:05'),

(16, 'Anthropic investigating unauthorised access of powerful Mythos AI model',
 'Anthropic is investigating reports that users obtained unauthorised access to its restricted Mythos model through a third-party vendor environment. The model was released only to a handful of trusted companies because of its advanced hacking capabilities. Anthropic said there is no evidence the access extended beyond the vendor system.',
 'https://www.ft.com/content/56d65763-69fe-4756-baf4-c8192b7aadaf',
 '2026-04-24 06:45:16', '2026-04-24 06:45:16');

-- Snippet-tag relationships (49 rows, grouped by snippet for readability)
INSERT INTO snippet_tags (snippet_id, tag_id) VALUES
-- Snippet 1: Data centre delays
(1, 2), (1, 8),
-- Snippet 2: China shock 2.0
(2, 6), (2, 10), (2, 14),
-- Snippet 3: Anthropic Amazon deal
(3, 2), (3, 3), (3, 4), (3, 8),
-- Snippet 4: Critical Software Updates
(4, 4), (4, 7),
-- Snippet 5: FAA Blue Origin (no tags — untagged snippet test case)
-- Snippet 6: Anthropic Mythos
(6, 2), (6, 7),
-- Snippet 7: SpaceX Cursor
(7, 1), (7, 2),
-- Snippet 8: Bugmageddon
(8, 2), (8, 7),
-- Snippet 9: OpenAI GPT-5.4-Cyber
(9, 2), (9, 7), (9, 18),
-- Snippet 10: OpenAI $852bn
(10, 2), (10, 11), (10, 18),
-- Snippet 11: Meta Zuckerberg
(11, 2), (11, 15),
-- Snippet 12: UK Anthropic Mythos
(12, 2), (12, 4), (12, 5), (12, 7), (12, 12), (12, 20),
-- Snippet 13: White House China theft
(13, 2), (13, 6), (13, 12), (13, 19), (13, 21),
-- Snippet 14: Schleswig-Holstein
(14, 10), (14, 12), (14, 13), (14, 16), (14, 17),
-- Snippet 15: Microsoft redundancy
(15, 2), (15, 9), (15, 12), (15, 16),
-- Snippet 16: Anthropic unauthorised access
(16, 2), (16, 4), (16, 7), (16, 12);
