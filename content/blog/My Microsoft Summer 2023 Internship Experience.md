---
title: My Microsoft Summer 2023 Internship Experience
draft: false
tags:
  - internship
  - microsoft
---
I haven't really used my blog for it's full potential, so I thought a post detailing my experience as an intern with Microsoft (for the Summer 2023 term) would be a great way to do so. I'm posting this in December, so ~4 months later, but rather late than never, right? Hopefully future interns that are wanting to explore Microsoft opportunities or that have already received an offer, can use this post to see some of the things Microsoft offers for interns, and help decide if it's the path for them.

# The Job Posting

I found the job posting through LinkedIn. I actually wrote a Python script to scrape LinkedIn Jobs to alert me (via Discord) of job postings that matched certain keywords. One day, I got a notification of a Security Engineering Internship at Microsoft (September-ish?). I can't speak on other roles like SWE or PM, but I can speak a bit about the security side of things. The job posting was an all encompassing posting for different security related positions, including security architecture, penetration testing, and security research. It looks like now they have divided into individual postings for all roles. Regardless, the job posting is where the first step happened!

# The Interview

The interview for me was broken into two stages.


## Phone Screening (Behavioral) September

I was first scheduled for a brief 30 minute phone call with a recruiter. This interview was more behavior based, with questions like "Give me an example of a time you worked on a team? What role did you take?" and "What are your greatest strengths and weaknesses?". Pretty typical questions to a behavioral interview, so just get some practice with common questions, and you should be good to go.


## Panel Interview (Technical) October

The next stage was a four hour long panel interview. There were four panelists, each an hour long. My panels differed from other security interns I talked two, but the format is the same universally. This is in no particular order.

1. Resume Walkthrough and Any Questions

This part was pretty simple. It consisted of some questions regarding your resume, and giving you the opportunity to expand on your experiences, education, extracurriculars, etc. It was also the opportunity for questions relating to the internship, role, or any other questions.

1. Team Introduction

Another part of the panel interview was team introductions. From my understanding, the people you interview with are typically the team/org you will be on. This seems to be true in past years, however, due to recent layoffs and budget cuts, this might not hold true for the time being (I will discuss this further, later on). They will introduce you to the teams, the scope of their work, example projects, etc. This is the best part to ask work related questions to see if the work seems to be fit for the experience you're looking to gain.

1. Code Review + Threat Modeling

This is where my experience starts to branch off. I had a Code Review section, where I analyzed C source code to identify vulnerabilities within the code. For me, this makes sense, since part of the job description was vulnerability research. The other section was Threat Modeling, where I was given an example service or product, and had to identify potential threats and mitigations to those threats. All-in-all, these two make sense for a Security Engineer, but some other security interns I talked to had these sections replace with your Leetcode-style coding interview. For SWE interns, this section would also be your coding interview. The best way to summarize this section is that it's going to be testing your technical ability within the field you're applying for.

# The Offer

I received my offer only six days after my panel interview (so late October). I'm pretty sure interviewing and offers go until late November and early December. There isn't much to talk about here except give you some numbers for the offer. Keep in mind, this is Summer 2023, so numbers are subject to increase or decrease.

- Base Pay: $7,890/month salaried
- Relocation: Corporate Housing or $7,000 Stipend
- Travel: $300 Allowance + Paid Flight or paid mileage
- Commute: $1,200 Allowance (ie: rental car)
- Other Benefits: Health insurance, AVIS ADW discount, ORCA transit card, Perks+

# Layoffs and Budget Cuts

Because layoffs and budget cuts were happening widespread (Meta, Twitter), a lot of interns were worried about Microsoft rescinding offers. Luckily, I don't think any Microsoft interns had their offers rescinded, but there was a lot of internal movement regarding interns. For example, when I was initially interviewing, I had interviewed with E+D (Experiences + Devices). However, most interns were shifted over to C+AI (Cloud + AI), and I was specifically moved to Azure Core. I believe this to be the result of a few things: budget cuts, layoffs, internal reorganization, and the AI boom (thanks OpenAI!). I'm not going to delve too much into the internal structure of Microsoft, as honestly, it still hurts my head to try and comprehend it. But, this was a sour moment for me, as the project I was assigned didn't really align with what I interviewed for, but you win some and you lose some.

# AirBnb

I opted for the $7,000 relocation stipend, as I heard from previous interns that the corporate housing can be hit or miss. Typically, they put interns in the University of Washington dorms, which lack kitchens, air conditioning.. didn't sound appealing to me. I spent a while looking through AirBnB's, but ended up finding one in Bothell and got a roommate who was also interning at Microsoft, which was nice. For anyone who decides to go with the relocation stipend, the Unofficial Microsoft Discord ([https://discord.com/invite/mMaJhYd5rk](https://discord.com/invite/mMaJhYd5rk)) is a great resource to find roommates, along with a bunch of other information.

# Intern Welcome Week

The first week is dedicated to the "Welcome Week", so you can be stress-free as you get adjusted to your new environment. I really liked it, as I did not look forward to the idea of flying in, unpacking, and then diving straight in on Monday.

- Monday (Intern Orientation): This was our orientation day where we got to learn about the campus, the Puget Sound area, Microsoft resources, and more. We also did some standard ice breakers and got swag. The swag for our year was limited to that of past years (according to returning interns), but we got a Microsoft Intern hoodie, sticker, and patch. I know some teams/orgs also independently give interns other merch (like Azure-specific backpacks, for example), but I didn't receive any swag beyond orientation day.
- Tuesday (Benefits Session): This day was dedicated to learning about all the benefits Microsoft offers its interns.
- Wednesday-Thursday: These were virtual Teams meetings to explore ERGs, Intern Cohorts, and other groups.
- Friday: Complete essential on-boarding tasks such as getting your equipment, signing in, registering any devices, etc.

# Equipment

Most interns receive the same equipment. Similar to the swag, some teams/orgs will provide more equipment, but everyone gets the base.

Computer: Surface or Thinkpad (apparently some Macbooks too?)

Peripherals: Wireless keyboard and mouse, headset

Other: USB-C docking station for HDMI, Ethernet, USB-A, etc.

# The Office

The campus was one of the best experiences. For those not familiar, buildings are labeled like Building 92, Building 37, etc. Most buildings also have their own cafe inside, where you can get lunch (the sub sandwiches are so good!!!). My building was 'Unassigned Offices' which was essentially a first-come-first-serve idea to offices. All offices come equipped with a standing desk, monitor (HDMI), and Ethernet cable. The perfect setup for setting down your laptop, plugging in the docking station, and connecting HDMI and Ethernet.

# The Work

I can't really delve too much into the actual work I did, because yannow, NDAs and stuff. But, I can discuss some of the learning opportunities that I found:

- New programming languages: My codebase was entirely C#, so I had to quickly learn and pick it up. I also had to brush up on my PowerShell skills, since a lot of internal APIs use PowerShell.
- DevOps: I had very basic DevOps skills going into my internship. I knew how to `git add`, `git commit`, and `git push`, and that was about the extent of my working knowledge with Git. Working in such a large codebase and having to test code through pipelines and pushing hotfix branches will definitely make you learn more Git (and be thankful for the simpler projects).
- Cross Functional Teams: It is impossible for you to understand the entire codebase of the project you're working on, unless you are starting from scratch. This is another thing I had very little practical exposure to: large codebases with hundreds of thousands of source code files. You cannot be expected to learn what each component does. As much as I _wanted_ to understand the depth of my project, I had to realize in order to meet deadlines, sometimes you just need breadth over depth. Reaching out to your manager to find out "who is responsible for this component" and then reaching out to them to have them explain it really helped me save time.
- Time Management: You are assigned a project and only have 12 weeks to get it done. For me, it started out pretty slow but quickly ramped up in the last weeks, and I felt a lot of time crunching pressure. Try to organize your project and outline it in a week-by-week (or even day-by-day) schedule to stay on task. This will help you finish your project on time and also make sure you have updates to provide in your Standup Calls or 1:1s.

# Networking Opportunities

Microsoft encourages networking, which I really enjoyed. There are so many opportunities to not only connect with other interns, but also full-time employees.

## Intern Networking Program

This is a program dedicated for interns. You simply sign up, and they will pair you on a weekly-basis with full time employees in the same field as you. You can meet virtually or go grab lunch-- it's up to the both of you. It's a great way to learn about other teams, the work they do, get advice, and build connections.

## Intern Cohort

Microsoft also recently started an Intern Cohort program. Interns are put into cohorts of roughly 10 people per cohort. Your Cohort lead will prepare weekly activities for you, such as game nights, visiting parks, grabbing lunch, or whatever else. This is another excellent opportunity to connect with interns.

## Explore Your Building

Your team will have a designated building. There's definitely going to be other interns in your building, so try to find those interns. We ended up making a GroupMe with all of our buildings interns, and scheduled a meeting room every Friday for us to work together in.

# Other Cool Things

Microsoft has a lot of other cool events that really makes it a standout internship experience.

## Puzzle Day

Puzzle Day happens every year during the internship season for both full-time employees and interns. It's an entire day dedicated to solving puzzles (you'll see a common theme that Microsoft employees love puzzles). The puzzles are developed by Microsoft employees and they put a lot of work into it. There's a great mix of easy-to-solve and absolutely stump you puzzles.

## Safari Hunt

This is similar to Puzzle Day, but incorporates a more physical aspect. You solve puzzles, but solving puzzles will lead you to a location. You have to run around campus, find these locations, and scan QR codes.

## Microsoft Intern Game

If you have ever watched _The Amazing Race_, this event is similar to that. You have an entire weekend dedicated to exploring the Puget Sound. As similar to above, you solve puzzles, leading you to a new location, where you will travel to (requires a car) and continue solving puzzles. You do this Saturday through Sunday, and will even have to spend the night in your car or somewhere else. This event is more extreme, because it can be extremely tiring driving around at 2:00AM, but it was the most fun event by far.

## STRIKE CTF Events

There are also STRIKE CTF (Capture The Flag) events that happen throughout the summer. There isn't a regular schedule, but just be on the lookout for emails regarding it. These are cybersecurity CTFs, so for those not familiar, you are given a problem and need to find a flag-- usually a string of text. These events are not as beginner friendly, and typically requires a pretty good understanding of Linux, CLI, and scripting. For those interested in the security field, though (like me!), a super fun event (and my team ended up getting first place and some STRKE swag).

# Summer Wrap-up

Twelve weeks will go by faster than you think. It started off slow for me, as I spent a lot of time learning a lot of the Microsoft terminology, technologies, etc., but once you get started on your project going full-speed, it ramps up exponentially. On the last week of the internship, you have to prepare a ~10 minute presentation to present to your organization. I would suggest starting this as soon as you start working on your project, so you can add content as you go, and are not rushing the last minute to remember what this line of code you added does 😉