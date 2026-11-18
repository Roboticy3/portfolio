---
layout: ../../layouts/MarkdownLayout.astro
title: "A Game about Roaches"
description: "Writup for RoachGame"
date: "2026-11-17"
---

# Part 1. Voted most likely to make a successful videogame
At the end of high school, I started to get interested in the idea of a game
where you could climb on any surface. Naturally, I just started working on it immediately, making no consideration of
how hard that would be, or if it would even be fun. There's a good reason climbing is limited in most games, though to me that
didn't make much intuitive sense. If you could run freely on the ground, what's
the problem with the walls? 

There are two problems, it turns out. 1. The character, and 2. The camera. In unrestricted wall climbing, both
of these entities need to know what to do in every possible combination of rotations
the character can make- tilting up and down, tilting left and right, as well as
the usual spinning and translation -all in a way that preserves the user's
perception of momentum.

As far as implementation is concerned, you also need to know, like actually know,
some stuff about system control theory, physics, and linear algebra, which was way beyond
my level. I'm confident, now, that I could supply the linear algebra knowledge required for
this project. However, the physics and control theory aspects are
still beyond me. 

By "control theory" I mean the theory of balancing a dynamic system so it 
stabilizes, particularly the physics of the character controller. The base
CharacterBody system in Godot does most of this for you. However, more customized
character controllers inevitably have to achieve their own controls via the
more generalized RigidBody, which offers fewer safeguards against things like
exploding velocity and angular velocity vectors, sudden acceleration and clipping.

I was *always* working on RoachGame. If you saw me on campus, or in class, in freshman or sophomore year, you probably were looking at a man making a game about bugs. And I wasn't making much headway. I've already written about
[loops](Lageta%20and%20Moon%20Science.md) and how I get stuck writing and testing code over and over. It's probably a mental disorder.

<style="width: 50%; left: 25%; position: relative;">![image of nerd thinking about bugs](media/nerdroach.png)

In these dynamic systems, there is also another particular kind of loop that's
easy to get stuck in. In the dynamic system loop, you adjust the parameters of
the system slightly, test the system, then adjust the parameters again. Character
jump height, friction, air control.. A good amount of adjustment is healthy for
any platformer game. But too much and it's just mindless code editing. You've
definitely crossed the line when you find yourself putting values back to what
they were before, excluding for the purposes of an actual scientific trial to
test for the effects of changing and reverting individual parameters.

From an external viewpoint, it might be percieved as productivity. But these two
things are not the same. First of all, the loop is an emotionally negative 
experience. Because I'm not looking far ahead enough, I patch and then remake the
same mistakes multiple times in the code. Sometimes it takes hours just to find
a mistake that I've already made, and fixed, sometimes multiple times already in
the past. Secondly, coding is not design, not engineering. Design and engineering
are trades, practices for making things of the imagination into reality. There
are some software that can be realized via coding and just coding, but this is
a small subset of the whole field. Finally, not only was I not making progress,
I was using this project as a way to avoid college. College was uncomfortable
and new. I was good enough at my classes to get through and still dedicate most
of my time to doomed videogames, and this was preferable to actually changing my
perspective.

There was, always, a part of me that understood all this was a bad thing. That's
why I got vehemently angry when my freshman dorm awarded me a paper plate "most
likely to make a successful videogame." This project doesn't really matter and
deep down I understood this. More than anything, my concience allowed it to 
continue because I wanted the game out of the way.

# Part 2. Hurting myself and other people
At one point, I had roped in a team of 5-6 people, including myself, to chip away at
the game. While I was the only person who would work idly, pretty much every day,
my friends really were trying to help. 

I was difficult to satisfy. RoachGame didn't have a clear design document. I
did not have a concrete image of how the game should look or sound in my head,
only descriptions of how it should feel to play. And as I was the only one working
on mechanics, though my friends meant well, there was only so much they could do.

We were also college students. I wasn't exactly breezing through college, I just
prioritized working on personal projects over my courses. My friends were much
smarter. They were getting internships and good grades and going to social
outings, figuring themselves out.

We had someone on dialogue. She will also be relevant to this story later. An
old friend from high school who was visiting to support with.. DevOps? Another high school
friend helping with textures and level design. And two others who were
apparently there.

From the top down, this doesn't look too bad for a team of students. On the ground
was a different story. I wasn't listening to much of the concerns about my team
about the lack of design direction for the game. I would dispatch my own friends
onto vague tasks without making time to discuss what doing those tasks would
actually look like. Additionally, while I was clearly pretty serious about wanting
to work, my friends were mostly normal people. They wanted to put something together,
but that was more of a means to an end for hanging out.

These factors culminated in 3 incidents worth noting.

First, at some point it got through my thick skull that the game needed a design
document. A scope for a playable demo. However, I was still trapped in the framework of writing
for the purposes of the game. The purpose of a design document is to be read by
members of a team. The game cannot read, and so the degree of technical language
used in a design document ideally doesn't matter. I was also desparate to make
a design document quickly.

In one week, I wrote a 9000 word Obsidian vault outlining everything in quite
technical language. There were inconsistencies, vagueities, and absurdities. Whether
it was a bad design document, I'm not sure. What it did do was it realized, in
the phyisical world, how impenetrable the project really was with me guarding the
front door. I exhausted myself to do this, too, staying up late many nights in a
row to make it happen. 

![its over 9000! idk. idk how to be funny](media/vegeta.jpg)

Second, at the peak of our man power, the full team was pushing for a demo release
with for a game jam circa 2023. Suddenly, my computer was the only computer that
could run the damn game. What was the issue? After hours of looking, the member
of the team whose role I described as "DevOps" found that the Godot editor had
installed a folder called "pablo" in his Users directory. This was a side effect
of Godot trying to load "pablo's" config for the editor- the software that facilitates the making of the game -
and not "the user's", or the name of whichever user was logged in on the host
computer. Normally, Godot achieves this with a special path called "user://",
which is replaced by "pablo" or "john" or whatever your username is on the system,
correctly loading user data. But due to some bug in the engine, the path had become
hard-coded as "pablo", even on other people's computers.

This is likely a side effect of the disorganization of the project. It's sort of
a karmic effect when you work to fast with computers that they bite back. Software
doesn't have enough time to cache and register things properly. Things get placed
in the wrong places. Shutdowns interrupt cleanups. I was always in a hurry, so
I do, intuitively, blame myself for this incident.

We failed to submit to the jam for a variety of reasons. We were not able to
finish the demo content to the planned degree by the jam deadline. 

Finally, my relationship with the texture and level artist in particular deteriorated, largely because of how I was assigning tasks. It took a long time for her to have something to show for her work. She had familiarity with hammer, but not Blender. While we explored trenchboom, the tooling to integrate Godot with trenchboom was still nascent and finnicky (not anymore, though. [Check it out!](https://github.com/func-godot)). On top of that, because I was being vague about what I wanted, it was hard to make measurable progress. When she finally did present a result, I was unhappy with it, and asked for revisions. From the expression on her face, it was clear I was not getting revisions.

![aluminum](media/aluminum.png) ![metal_beta](media/metal_beta.png) ![sewage](media/sewage.png)

In retrospect, the textures are pretty good.

# Part 3. Getting it out of my system
GhostJam (separate from the earlier jam) was a cool opportunity. Revive a dead game! While I had a lot of negative
emotions around RoachGame, maybe I could include that in my submission in some
way that was productive to help me move on with my life.

This was in 2025. I had some time away from the project and some other experiences
to put it into perspective.

I decided to make a developer commentary, kind of like this article, but playable.
Hopefully, it would be therapeutic to get the basic mechanics of RoachGame working
as a simple walking simulator (with full wall climbing), and Valve-style developer
commentary nodes.

![roachgame developer commentary screenshot](media/roach.png)

Overall, this was a very positive experience. While it was a lot of work to throw
the demo together, there's no way to get around the fact that game development is
hard. And it felt like an application of all the tricks I had learned about subviewports, dynamic UIs,
and interactive level design while developing RoachGame's unique character and
camera.

You can still clip through the waterslides in the final level. Oh well. I did
feel satisfied completing it, despite it not being as well recieved as my more
arcade-y games uploaded to itch. This project is done.

# Part 4. Was it really so bad?

![kafka.webp](media/kafka.webp)

I really wanted to link to some of my team members' later works, but as far as
I can tell none of them are very "online" people. Which is fine, you're allowed
to not be online. If they don't have super public websites or profiles, I'm not
sure if I want to just drop their names here.

My friend who was helping with dialogue is much more than a dialogue writer. She
had some very impressive hackathon projects and research projects and now has
a full time job in the tech industry. One day in college she was giving me a ride. 
This was some time after the dust had settled with RoachGame, so I apologized about
giving her so much trouble about the project.

"It wasn't that bad."

Really?

"You shouldn't beat yourself up like that."

I think I went on a rant about how much it hurt to work on this project. How it
felt like I wasn't in control. I do remember I teared up. I know that
sounds silly but remember this was two years of my life.

Let's do some moral calculus. Clearly, I was negatively affected. While I did have
projects later in life that suffered from similar behavior patterns, they never
affected me to the same degree after this. I made some people angry and annoyed,
but out of principle I never cost people money on my personal projects. I would
never start a crowdfunding campaign for a game if it wasn't being run with the
utmost professionalism. And the team mostly moved on with their lives from the
weird guy and his bug game.

Calling RoachGame a catastrophic failure is still assuming the framework that
made me so irate in the first place: that it had to succeed, that I had to do
anything and everything to make the game happen. 