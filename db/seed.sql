-- SnippetMate seed data — full snippet dataset captured from the development database.
-- Load order: schema.sql first, then this file, as snippetmate_user:
--   mysql -u snippetmate_user -p snippetmate < db/seed.sql
-- TRUNCATE makes this safe to re-run; it wipes existing rows first.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE snippet_tags;
TRUNCATE TABLE snippets;
TRUNCATE TABLE tags;

SET FOREIGN_KEY_CHECKS = 1;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` (`id`, `name`) VALUES (18,'acquisition');
INSERT INTO `tags` (`id`, `name`) VALUES (1,'AI');
INSERT INTO `tags` (`id`, `name`) VALUES (7,'Amazon');
INSERT INTO `tags` (`id`, `name`) VALUES (6,'Anthropic');
INSERT INTO `tags` (`id`, `name`) VALUES (40,'banking');
INSERT INTO `tags` (`id`, `name`) VALUES (3,'China');
INSERT INTO `tags` (`id`, `name`) VALUES (8,'cybersecurity');
INSERT INTO `tags` (`id`, `name`) VALUES (2,'Data centre');
INSERT INTO `tags` (`id`, `name`) VALUES (54,'employment');
INSERT INTO `tags` (`id`, `name`) VALUES (4,'Europe');
INSERT INTO `tags` (`id`, `name`) VALUES (26,'finance');
INSERT INTO `tags` (`id`, `name`) VALUES (35,'Financial Times');
INSERT INTO `tags` (`id`, `name`) VALUES (50,'Germany');
INSERT INTO `tags` (`id`, `name`) VALUES (5,'investment');
INSERT INTO `tags` (`id`, `name`) VALUES (34,'media');
INSERT INTO `tags` (`id`, `name`) VALUES (28,'Meta');
INSERT INTO `tags` (`id`, `name`) VALUES (47,'Microsoft');
INSERT INTO `tags` (`id`, `name`) VALUES (48,'open source');
INSERT INTO `tags` (`id`, `name`) VALUES (23,'OpenAI');
INSERT INTO `tags` (`id`, `name`) VALUES (30,'policy');
INSERT INTO `tags` (`id`, `name`) VALUES (31,'test');
INSERT INTO `tags` (`id`, `name`) VALUES (39,'UK');
INSERT INTO `tags` (`id`, `name`) VALUES (45,'US');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `snippets` WRITE;
/*!40000 ALTER TABLE `snippets` DISABLE KEYS */;
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (1,'Data centre delays threaten to choke AI expansion','Almost 40% of such builds in US risk hold-ups, including projects tied to Microsoft and OpenAI','https://www.ft.com/content/f2bae708-f5c3-49b0-99c0-e4a11552427b','2026-04-21 07:25:41','2026-04-21 07:25:41');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (2,'China shock 2.0 should Europe welcome Chinese investment','Impelled by furious competition, hefty subsidies and sheer scale, the country\'s companies are cutting a swath through the world\'s most advanced industries','https://www.ft.com/content/7d51a630-a3de-4cc7-9f5f-0f3e7f0d305a','2026-04-21 07:25:41','2026-04-21 07:25:41');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (3,'Anthropic, Amazon Tighten Bond in $5 Billion Investment and Computing Deal','Amazon will invest as much as $25 billion in the AI company, which will secure up to 5 gigawatts in badly needed computing power in the pact','https://www.wsj.com/tech/ai/anthropic-amazon-tighten-bond-in-5-billion-investment-and-computing-deal-b9d8e513','2026-04-21 07:25:41','2026-04-21 07:25:41');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (4,'You\'re About to See a Lot of Critical Software Updates. Don\'t Ignore Them','Anthropic\'s newest, as-yet-unreleased AI model is a hacker\'s dream, so here\'s the cybersecurity advice you need to start taking seriously right now','https://www.wsj.com/tech/personal-tech/anthropic-mythos-security-software-updates-573cc9b3','2026-04-21 07:25:41','2026-04-21 07:25:41');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (9,'FAA grounds Blue Origin\'s New Glenn after satellite failure','Amazon\'s Kuiper ambitions take a hit: the FAA halted New Glenn operations pending an investigation into a failed satellite deployment on Sunday. Amazon may need to rely more on SpaceX launches to hit its FCC deadline.','https://www.ft.com/content/cbc55056-91f2-4b69-af26-fd749fbf15ed','2026-04-23 03:13:26','2026-04-23 03:13:26');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (10,'Anthropic\'s Mythos model sets off global alarms','Anthropic\'s new AI model, Mythos, can reportedly find and exploit flaws in software running banks, power grids, and governments. Access has been shared so far only with the US and UK, triggering emergency responses from central banks worldwide.','https://www.nytimes.com/2026/04/22/technology/anthropics-mythos-ai.html','2026-04-23 03:14:04','2026-04-23 03:14:04');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (11,'SpaceX strikes $60 billion deal with Cursor','SpaceX has the option to acquire AI coding startup Cursor for $60 billion later this year, ahead of a potential IPO in June. Musk continues pivoting the rocket company toward AI and orbital data centers.','https://www.nytimes.com/2026/04/21/business/spacex-cursor-deal.html','2026-04-23 03:14:17','2026-04-23 03:14:17');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (12,'AI is finding bugs that hackers can exploit. Get ready for Bugmageddon.','Anthropic\'s Mythos recently uncovered a 27-year-old OpenBSD bug while burning $20,000 of compute over two days. HackerOne reports bug submissions up 76% year on year, with average patch time rising from 160 to 230 days. Security researchers warn the skill barrier for building sophisticated exploits has collapsed.','https://www.wsj.com/tech/ai/ai-is-finding-bugs-that-hackers-can-exploit-get-ready-for-bugmageddon-baaff236','2026-04-23 04:46:32','2026-04-23 04:46:32');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (13,'OpenAI releases new cyber security model to limited group of customers','GPT-5.4-Cyber autonomously finds software flaws for vetted customers in OpenAI\'s trusted access programme. The release comes a week after Anthropic\'s Mythos, with both labs framing the tools as defensive against AI-enabled attackers.','https://www.ft.com/content/cf3d62e0-1b6c-4e69-b5f7-facaca586dbf','2026-04-23 04:46:48','2026-04-23 04:46:48');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (14,'OpenAI investors question $852bn valuation as strategy shifts','Backers are uneasy about OpenAI\'s pivot to enterprise and coding tools while defending ChatGPT\'s consumer lead. Anthropic\'s annualised revenue reportedly surged from $9bn to $30bn in three months, driven by its coding products. One investor calls OpenAI \'the Netscape of AI\'.','https://www.ft.com/content/04ac7917-940b-4606-be5f-9eb895a7d982','2026-04-23 04:47:02','2026-04-23 04:47:02');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (15,'Meta builds AI version of Mark Zuckerberg to interact with staff','Meta is training a photorealistic 3D AI character modelled on Zuckerberg\'s voice, mannerisms, and strategic thinking, intended to give employees feedback in his stead. The project sits inside Meta\'s Superintelligence Labs push toward \'personal superintelligence\'.','https://www.ft.com/content/02107c23-6c7a-4c19-b8e2-b45f4bb9ce5f','2026-04-23 04:47:15','2026-04-23 04:47:15');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (18,'UK in talks with Anthropic over Mythos access for banks','Anthropic is discussing expanded access to its Mythos cyber security AI model with the UK government, with British banks pushing for expedited availability. The model is currently limited to roughly 40 mostly American organisations. Regulators and bankers have raised concerns about its dual-use potential.','https://www.ft.com/content/fe563a8e-e269-4a6b-a577-8ed16a805a7b?syn-25a6b1a6=1','2026-04-24 06:44:22','2026-04-24 06:44:22');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (19,'White House accuses China of industrial-scale theft of AI technology','White House science and technology policy director Michael Kratsios accused Chinese entities of running large-scale campaigns to distill US frontier AI systems. The administration plans to share threat intelligence with American labs and explore accountability measures. Beijing called the accusations slander.','https://www.ft.com/content/abde4e1e-c69a-4cc4-ad96-d88308314298?syn-25a6b1a6=1','2026-04-24 06:44:40','2026-04-24 06:44:40');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (20,'Inside the German state trying to break free from Microsoft','Schleswig-Holstein is replacing Microsoft products across 44,000 government accounts with open-source alternatives including Thunderbird, Open-Xchange, LibreOffice, and Linux. The push combines cost savings with digital sovereignty concerns. An email migration glitch caused weeks of disruption but the project continues.','https://www.ft.com/content/95bd87c8-a112-49a5-9b80-c280a6bb4283?syn-25a6b1a6=1','2026-04-24 06:44:56','2026-04-24 06:44:56');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (21,'Microsoft to offer 7% of US staff voluntary redundancy for the first time','Microsoft will offer voluntary redundancy to about 8,000 long-serving US employees whose age plus years of service totals 70 or more. It is the 51-year-old company\'s first such buyout programme. The move coincides with $140bn in planned AI capital spending this fiscal year.','https://www.ft.com/content/f5776fd6-22f3-43d1-806b-9858b64cfd18?syn-25a6b1a6=1','2026-04-24 06:45:05','2026-04-24 06:45:05');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (22,'Anthropic investigating unauthorised access of powerful Mythos AI model','Anthropic is investigating reports that users obtained unauthorised access to its restricted Mythos model through a third-party vendor environment. The model was released only to a handful of trusted companies because of its advanced hacking capabilities. Anthropic said there is no evidence the access extended beyond the vendor system.','https://www.ft.com/content/56d65763-69fe-4756-baf4-c8192b7aadaf','2026-04-24 06:45:16','2026-04-24 06:45:16');
INSERT INTO `snippets` (`id`, `title`, `content`, `source_url`, `created_at`, `updated_at`) VALUES (23,'Vue.js - Wikipedia','Vue was created by Evan You after working for Google using AngularJS in several projects. He later summed up his thought process: \"I figured, what if I could just extract the part that I really liked about Angular and build something really lightweight.\"[16] The first source code commit to the project was dated July 2013, at which time it was originally named \"Seed\".[17] Vue was first publicly announced the following February, in 2014.[18][19]\n\nVersion names are often derived from manga and anime series, with the first letters arranged in alphabetical order.','https://en.wikipedia.org/wiki/Vue.js','2026-04-26 08:05:01','2026-04-26 08:05:01');
/*!40000 ALTER TABLE `snippets` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `snippet_tags` WRITE;
/*!40000 ALTER TABLE `snippet_tags` DISABLE KEYS */;
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (1,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (3,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (10,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (11,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (12,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (13,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (14,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (15,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (18,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (19,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (21,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (22,1);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (1,2);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (3,2);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (2,3);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (19,3);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (2,4);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (20,4);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (2,5);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (3,6);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (4,6);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (18,6);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (22,6);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (3,7);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (4,8);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (10,8);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (12,8);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (13,8);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (18,8);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (22,8);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (11,18);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (13,23);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (14,23);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (14,26);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (15,28);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (19,30);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (18,35);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (19,35);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (20,35);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (21,35);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (22,35);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (18,39);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (18,40);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (19,45);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (20,47);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (21,47);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (20,48);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (20,50);
INSERT INTO `snippet_tags` (`snippet_id`, `tag_id`) VALUES (21,54);
/*!40000 ALTER TABLE `snippet_tags` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

