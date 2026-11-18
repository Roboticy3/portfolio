---
layout: ../../layouts/MarkdownLayout.astro
title: "Lageta and Moon Science"
description: "Writup for Lageta and Moon Science"
date: "2026-11-17"
---

<style="min-height:512px; width:100%;">![Lageta embed](/games/Lageta/build)

Lageta and Moon Science were long term undergraduate research projects I did developing games. By all conventional measures, they are not very good research projects or software projects. But, for solo undergraduate projects, they were fairly technically impressive, and shaped me into the type of developer I am today. This essay serves as a reflection on the projects together, starting with Lageta and ending with Moon Science.

If you frankly couldn't care less about me or who I am, this essay more generally is about puzzle game design and loops and loop detection. If you played either of these games and are curious about how they were made, the following should also satisfy that curiosity.
# Part 1. Lageta

## Initial Interest In Research
My mom is a professor. Getting a graduate degree was and still is, as of writing, a possible path for me. However, having experience in undergraduate research seemed to me like a necessary prerequisite before pursuing this idea.

Research also always seemed like something I would enjoy, or ar least tolerate. Reason being that it would give me structure and deadlines to support and direct my personal projects, hopefully keeping me more productive.

Left unattended, I'd work. At the time, I was self motivated, but that's different from being self directed. I could work and work on something, and achieve no result, nor any progress towards a result. And this would continue for months or years on a given project. Besides the idea of getting a masters or PhD, I was hoping that writing papers would get me to actually finish a project from time to time.

I was even more socially awkward back then, though. It took the encouragement of my Mom and multiple friends before I even started looking at the research going on in my own department to see if I could seek mentorship.
## The Enigmatic Professor Sun
After speaking with a few different professors, the faculty member whose research goals I aligned with the most was [Dr Yifan Sun](https://sarchlab.org/syifan) . He has a lot of interesting work in Computer Atchitecture, specifically GPUs, and his graduate students in SArchLab also have lots of cool stuff to check out. 

GPU architecture is hard. And very hard to teach. There is a long, low simmer in the videogame industry to produce a "digital logic game" which teaches one discipline or another within digital architecture. However, these have failed for a variety of reasons. They largely do not reach their audience, either in or outside of the classroom, and from my experience playing many different digital logic games, largely just aren't fun. Even very strong entries in the lineup, like [Shenzhen IO](https://www.zachtronics.com/shenzhen-io/), fail to do what I think a digital logic game can do: bring someone who is not already interested in computer architecture into the field. 

These are not my thoughts, originally. Though my research did involve going out and finding a lot more of these games and observing their approaches. Dr. Sun introduced me to Shenzhen IO and his premise of producing an educational digital logic game with a softer difficulty curve. Then, the game could be tested on his students against regular assignments.

I had, at this point, a short, sad history in game development. I had failed to make 2 videogames over the course of 4 years (due to the phenomenon I mentioned earlier). I had a lot of experience in Godot Game Engine. But not a lot of (good) experience in project management. 

This was also *right* at the dawn of the "AI Summer," my term for the period in time when artificial intelligence began to be available commercially for automating tasks via agents. Though, unless you were really cutting edge, in Fall 2023, if you were a busy professor, and you wanted to spin up an educational game, you couldn't just hammer out 20k words of markdown and sacrifice a goat, you needed a hench-man. And I was certainly still coding by hand at the time (I'm one of the people who went through a phase of vibecoding everything, and as of writing am back to handwriting most stuff at time of writing. Life is funny.)

Though I wasn't caught up on the latest in harness technology, I could nominally make video games, so when he told me about the project, I immediately put myself up for it. The project was codenamed "Lageta," a scope was outlined, a web framework was chosen, and I was off.

Did you catch the mistakes? We are trying to do research, after all. As far as research is concerned, what went wrong here and what could have been done better?
1. I set out to do research, but now I'm making a game! I didn't even have a strong research question.. This would come back to bite later.
2. I didn't know a damn thing about digital logic, digital architecture, or really game development. And that's ok. However, this breaks my rationale for why Dr. Sun's work was more interesting to me than the other faculty's work, that my previous game making experience could be applied here and not elsewhere. In truth, you have no idea where your experience will be applicable, and I should have picked research based on where I believed I would have the most support and the most potential to grow, in addition to personal curiosity.
3. Good research takes time. But also has deadlines. This was a crucial element I mentioned earlier for making sure I make progress. We set a scope, but no deadline. Only weekly meetings.
4. Nobody else was working on this project. Games are big and complicated, and I would really be hurting for an extra pair of hands. We should have put off starting development of the game until we got another undergrad to help with the development. That ties back into the first point.

I don't blame you if the lack of teammates didn't stand out, but at least one of these should have been a huge red flag if you at all value your personal wellbeing. Let's watch this disaster play out in brief, shall we?
## Naive Implementation
Digital logic circuits are what make your computer compute. They're pretty cool. Everything from your motherboard, CPU, and memory, and even graphics card can be reduced to digital logic designs at some level. The idea with simulating digital logic is, instead of playing with breadboards and LEDs in real life, the player builds circuits in the game world to achieve in game tasks, and the simulation tells them how the circuits should work instead of reality.

Of course, having the "tunnel vision" mindset that I have, building a simulator was more interesting to me than the design of the game at the time. I really just wanted to code. Design is much more interesting to me these days, and I will talk more about design approaches to digital logic games later.

There are two dominant approaches to implementing a digital logic simulation: the naive approach and the realistic approach. This section will outline the naive approach, since that's what is used in Lageta. Before moving forward, some prerequisites:

A "digital logic simulation" is a software system that simulates an electrical circuit, represented by a network of gates connected by wires. You will also see these called components and nets respectively. 

A "gate" is a function. It has some "input" slots for wires to point into, and some "output" slots for wires to point out of. Real logic systems use electricity, and electricity doesn't respect the human notion of "in" or "out", but the naive implementation assumes each gate has distinct, nonoverlapping input and output slots. When wires are connected to a gate, they must connect to a specific slot. In an even more simplified approach, two wires may be restricted from connecting to the same slot on the same gate to avoid confusion. An example of this confusion will be shown in the next section.

Wires are precisely an input slot of one gate paired with an output slot of another. Wires also remember the last charge or "value" passed through them. The assumption is that the last value passed through the wire is being supplied to that wire continuously. Again, not necessarily true, but this shortcut actually appears in both the naive and realistic approach, so it's definitely good enough for 2023 me's purposes.

![lageta screenshot](media/lageta.png)

(Red, Blue, and Black wires represent the three states in the game, High, Low, or Neither).

The user can supply wires with values. When this happens, if a gate has this wire as an input, that gate is "called" as a function. The return values of this function are then supplied to the output wires. One can also think of each gate as having a list of combinations of inputs matched to combinations of outputs, when a wire on one of its inputs is given a new value, it reads the held value of *all* of its inputs and finds the corresponding combination of outputs.

"Reverse" gate with 4 inputs. Voltage may be High or Low.

| Inputs                | Outputs              |
| --------------------- | -------------------- |
| ...                   | ...                  |
| High, Low, Low, High  | High, Low, Low, High |
| High, Low, High, Low  | Low, High, Low, High |
| High, Low, High, High | High, High, Low, Low |
| ...                   | ...                  |

Say you wired two Reverse gates together in sequence, so that the first output of the first gate was wired to the first input of the second gate. Second output to second input. Third output to third input. And fourth output to fourth input.

Then, the player supplies the first gate with the values High, Low, High, Low.

Immediately after, the first gate will supply its outputs with the values Low, High, Low, High. 

Immediately after that, the second gate will supply its outputs, if any, with High, Low, High, Low.

Note that if we allowed multiple wires to be supplied to the same input, it could cause ambiguity. Here is the full function table for a simple gate with one input and one output called "Not."

| Input | Output |
| ----- | ------ |
| High  | Low    |
| Low   | High   |

Say I could connect two wires to the input, then supply one with High and one with Low. What value should the Not gate output?

The real answer is that the two wires, since they are connected to the same pin, may become "Illegal", "High Impedence", or "Floating", depending on who you ask. Those are just some of the many possible states in real life not sufficiently described by High or Low. In response to the exotic value, the Not gate.. Does.. Something?

I'm still not sure. Some gates in some manuals for some gate manufacturers have table entries for what they do in response to Floating, High Impedence, or other states, but it's rare and not consistent between make and model.

So, the naive thing to do is to simply prevent this situation from happening. We can copy the value of one output slot to multiple wires just fine, but one input slot can only correspond to one wire. This was the confusion referred to earlier. If you try to connect two wires to the same input in Lageta, the game prevents you from doing so.
## Loops and Loop Detection
The second major issue with the naive implementation is the issue of loops.

Say I have a Not gate with a wire connecting its output to its input, then I supply the wire with High.

Immediately, the Not gate supplies the wire with Low.

Immediately after, the Not gate supplies the wire with High because its input has changed its value to Low.

Immediately after that, the Not gate supplies the wire with Low again because its input has changed its value to High.

This continues forever. Programmers will recognize the incoming stack overflow error after the 1024th stack frame, and are already approaching my location with lectures on iteration over recursion, and possibly weapons.

Computer Science students should also recognize the similarity of this digital logic simulation to Djikstra's algorithm (recursive implementation). The goal of finding a target is replaced with the goal of "delivering" a voltage to the end of the circuit.

By the time I got to this issue in the codebase, I was starting to recognize that I was way in over my head. I was 19. I had never written in TypeScript or JavaScript before, and SvelteKit was a rather heavy introduction. I had never simulated digital architecture before, and a full simulator + a game was also starting to weigh on me.

My solution to the loop issue was to detect when the user attempted to add a wire, search the network for loops caused by that wire (using djikstra's algorithm more conventionally), then, if a loop was found, simply not allow the wire to be placed. In Lageta, you may not produce loops in your circuits.

If only I had the foresight to do the same in my management of the project!

Say you have a codebase with one issue, but fixing this issue introduces a new issue.

Pablo fixes the issue, introducing a new issue.

Pablo fixes the issue, introducing a new issue.

This, also, continues forever. Research was not saving me from my old habits of poor organization and mindless pushing against complex problems, because I was not doing research anymore, I was simply programming again. Without a paper deadline, a team, or indeed a proper research question, there was no alternate path in this project with which I could "break out" of this loop.
## Novelty
I spent a good deal of time on one feature that ultimately did not make much impact, but had the potential to really set Lageta apart. The idea was to make the level select screen, the screen where users navigate between individual circuit building challenges, also a circuit building challenge itself. If the user wanted to access certain levels, they would have to change the wiring on the level select screen.

Dr. Sun advised against this repeatedly, and he was right. Not because it wasn't an interesting idea, but because I was already so swamped with work just getting *something* functional out the door that adding this consideration on top would burn me out. Not to mention risk confusing players.

Where most digital logic games fail, for me, is a lack of novelty. Take a good puzzle game, for example. Like the generational puzzle game [Portal 2](https://store.steampowered.com/app/620/Portal_2/). Digital logic games are all ultimately puzzle games. What can they learn from Portal 2? 

Well, Portal 2 balances learning new things about portals with learning about new things *in* Portal 2: light bridges, turrets, gels. These mechanics are not necessary to provide a full game about portals. Portals are sufficiently deep of a mechanic, pretty much on their own, to make an interesting game in full. But the extra stuff breaks up the monotony of doing level after level of *just* portals. It also serves as additional context for the world. Deadly turrets, mysterious light, and clinical gel fit the uncaring environment very well, and this is thanks to years of experimentation by the game's developers to find what exactly works for that game specifically. Those extra mechanics are what some people call "novelty" in a game design context.

![light](media/portal3.jpg) ![gel](media/portal4.jpg)

![turret](media/portal5.jpg)

Most example of digital logic games are, as far as I know, just the gates and wires. They don't provide these extra mechanics because they want to focus on the reasonably complex central idea of building circuits.

While my level select circuit idea was also just gates and wires, it would have forced the user to think outside of the box to unlock certain levels, and see circuits from a different angle. Not just a thing that goes in a level, but also a thing that might exist elsewhere, too.

Dr. Sun did support the idea of another mechanic which, if completed, would have provided novelty by more direct means: a suite of tools gradually unlocked for beating certain levels. In hindsight, this was the right move. More time spent on tools would have made the game stand out a decent bit. We had some interesting ideas aside from the basic voltmeter, like a tool that performs De Morgan transformations automatically after they are taught to the user.

Part of good software development is being able to handle novelty or "additional features", in more enterprise terms, without losing track of the core product. Novelty is important, but balancing the development of the level select screen with other important features would have made the final result feel more polished.
## What's your Research Question? 
When it came time to actually try to conduct a study, this ship had too many holes to patch up. The conference paper was horribly rushed and rejected immediately. The research question we settled on was something along the lines of.. Does it work? Is Lageta more engaging than a regular assignment? We used a survey, and save data collected from students. All things considered, it could have been worse. They did enjoy the game, which is a win. If I wasn't trying to twist this into a research project, I might have had the clarity of mind to continue with the project and push for a Steam release. Anyway, the problem is that we didn't have the research question on day 0.

I know research doesn't always go this way, the ideal. But, just for example, last month I was working on an AI design assistant (disambiguation: an AI assistant made with the purpose of helping with designs in a particular context) for a hackathon. We're considering ways to continue the project, and pretty much the first things I put together were research questions. Is *this* part of the system necessary? How much does the strength of the model at *this* step of the process affect the output quality experimentally? Verifiable questions that we can work on slowly and steadily moving into the future. And an AI design assistant is much less interesting than a digital logic game. 

Here are some that I could have used for Lageta. Off the top of my head: how long does it take to make an assignments worth of content in Lageta versus a traditional assignment? How long does it take to grade? Can these ratios be improved? Another application of educational games is that they can offer convenience to the educator (obvious, but a source would be nice), and these research questions don't require IRB certification and a large human sample size to get away with.

That was another problem. Our sample was only Dr. Sun's classroom. We made some plans to coordinate with other programs, but never mobilized anything. The resulting data was too little to come to any strong conclusions, even if the question were strong to begin with.

Engagement is not easy to measure. Students particularly are often overly positive or overly negative. It can be a result of anything from doing poorly in the game to what they ate for breakfast to how much they had to drink last night. Asking someone how engaged they were in the past and expecting a sober answer is a fool's errand. 

A big part of good research is clear communication, and clear communication often comes from clear direction. Direction isn't necesarily knowing exactly what your research question and experiment and methods are going to be from day zero of your studies, but it does mean always moving with purpose and being aware that investing time in one direction for your project comes with the opportunity cost of not investing that time into any of the other directions available to you. The narrative throughline of the research will not reveal itself if you change directions aimlessly, without considering this. At the very least, the research question cannot be an afterthought.
## Desperation
I got very desparate at points to make the game, or the paper, and to finish it. The project was already cluttered. This was made worse by many late nights patching individual things as fast as I could.

Coding is like driving. Driving fast doesn't actually save your time ([here's my post-rationalization](https://doi.org/10.1038/s44458-026-00100-3)). In my experience, coding fast gets at best the same amount of work done as coding slow, in exchange for more effort and exhaustion.

Writing, at the technical level demanded by an academic paper, may fall into a similar conflict. Whenever I tried to write quickly, I would make mistakes that ended up costing me time in the long run to fix. Diagnosing and fixing a mistake, after a marathon of writing, is no easy thing either.

For 2 years, this continued. Just like the previous failed game projects.

My motto after this project and other similar situations is "do not move in desparation." Desparation is my word for precisely that state of moving so fast that you make mistakes you have to address after, and feeling like you have to. On top of loop checking, consider this a "depth test" for only your deepest of programming adventures. Am I moving with desparation? You can get a surprising amount done without!
# Part 2. Moon Science
The most damning weakness of the naive implementation is its immediacy. The real world is not immediate. Computation takes time. In fact, this is exactly "why" plugging a real gate into itself doesn't explode the universe. Because the charges take time to travel through the component and the net that causes the loop, infinite recursion is spread out over time, and the universe is saved.

After more research, reflection, and a break, I wanted to take another shot at making a digital logic game. This time, it was a credited, senior project in.. music?

Here's the idea: instead of a computer science research project, do a senior music project. William & Mary doesn't have a proper digital arts program, but there are lots of talented people who work at the intersection of computation and art in the music department.

Lageta had a weakness where a lot of strain was placed on the player's eyes to keep track of what was going on in the circuit (many other games share this issue). Wires would change color to indicate their value. When the player's circuit was built correctly, that is to say, they had a solution to the puzzle, the wire colors was would "line up" with a truth table and an oscilloscope. Unless you are already familiar with computer architecture, relying on your eyes for everything was overwhelming at best and unintelligeble in some cases. So, why not offload some of the player's visual processing to their ears?

Digital logic circuits, on paper, translate fairly well to *synthesizer* circuits, a similar class of computer hardware intended for generating audio rather than being a full computer. Maybe I could make a game where the audio is simulated instead of some abstract notion of voltage.

Again, do you see the mistakes here? First, let's talk about the good.
 - It's Spring 2026. I'm older and very marginally wiser at 21 years old.
 - I'm not larping as a researcher. A senior art project fits the bill much better for what I'm trying to achieve.
 - The senior project also provides a strict deadline. Technically, I started working on this project in Fall 2025, but the deadline did give me motivation to wrap things up and be reasonable about features.
Now we're squarely in the realm of software development, and you software developers should be quaking in your boots at some of the details.
 - Audio and synthesizer simulation is hard as balls! You maniac! You don't have any physics training or previous experience in this field! Turn back! Turn back! Did you not consider *any* other design approaches before going down this path? You do realize design is iterative in that it splays out as well as moving forward, right? You're.. You're not even listening to me, are you?
 - I had no plan for how to actually implement this. I was using C++ Godot Extensions, but desparation would have me switch to Godot modules, then back to extensions, then back to modules. These switches were costly and stressful taxes on an already difficult development cycle.
 - I did have a loose design document for the game, but it was nowhere near the caliber this project needed to succeed. Like Lageta, I started by programming. A nice thought, sure, but things would have gone better if I had started in an Obsidian vault or with some D2 diagrams.

I guess it wasn't that long ago, either. Ok. I'm still a fool. But I won't let that take away from the fact that there were good ideas here.
## Applied Tragic Optimism
After the naive implementation, there's the realistic implementation, which utilizes an event queue to store values on nets at given times and dispatch them accordingly. I could go into great detail, but it's besides the point. Loops and multiple "wires" on an input are allowed now. 

Like Lageta, much of the struggle of this project was desparate programming. The challenge was implementing realistic digital logic in a way that was A. suitable for audio simulation (performant, compatible with audio data structures) and B. suitable for use with Godot (tolerant of resampling (!!), compliant with Godot's occasionally archaic audio system). I had gotten better at regulating myself at this point in time, 

My recommendation for Godot compiled stuff these days is definitely [Godot Rust](godot-rust.github.io). Not because of Rust, but because the way they set it up has greatly simplified the process of writing compiled code for the Godot game engine, and developing with it requires far fewer dependencies than working with [godot-cpp](github.com/godotengine/godot-cpp). Even though they technically use the same base GDExtension library.

Somehow, I managed all of this with time on the side for some actual, genuine game design. Did I mention I had a completely separate Game Design class with a completely separate project happening at the same time as this? No wonder I feel so burnt out now.

Forged in the hel-fire of my senior year, and the years before, I had some new sensibilities. I liked space and aliens. I had designs for a story-focused game about exploring an alien planet where little weirdos pop out of the ground and mess with your circuits. I wouldn't have time for such additional features, but working in the spirit of these ideas guided me to my best potential.

Moon Science features a unique level select screen. While I definitely wanted it to have circuitry, the main appeal is an "[infinite zoom](github.com/Roboticy3/infinite_zoom)" feature (prototype linked on github), which dynamically loads multiple "planes" depending on the zoom level and position of the camera, inspired by Google Earth's satellite image and photogrammetry loading system. This lets me put levels inside of levels. The player starts in orbit and zooms down through the clouds before reaching their puzzles.

It's a nice touch, and I wouldn't have added it if I weren't aiming for something even higher. A classic trope of digital logic games is construction and optimization. You build a gate, then use it, then rebuild it better. The way it was to work in moon science is you would make a gate, use it, then simply zoom in on it. The level where you made the gate would simply be loaded right there, and you could optimize it, zoom out, and be right back where you were, using it again. Unfortunately, this did not pan out, since Moon Science is a demo with only 4 levels.

The last novelty I'd like to mention is that moon science is a sokoban. Another issue with Lageta, and other digital logic games, is that once players unlock many gates to use in puzzles, they don't know which ones to pick. Moon Science gives you all the pieces you need. You simply place them one at a time and move them into the right place. Playtesters still found the demo challenging, but because there was always a piece to put down, they got stuck less than with Lageta.
## Whiting's World
My advisor on this project was [Dr. Benjamin Whiting](https://www.wm.edu/as/music/directory/whiting_b.php). He has a lot of work in experimental audio synthesis, and has a lot of great advice and books for this project.

Fire, however, did not yet teach me humility. To be honest, I feel sometimes like I didn't deserve to go to college, for how many times I ignored the invaluable advice given to me by members of the faculty. What a horrible cost, to throw someone so self centered into that environment. 

Deserving or not, I was set on making the game and I was going to make it my way. Dr. Whiting still helped make sure I was making progress. But for all the good advice he gave: here's a good book on audio programming in C++ that you should do exercises from, absolutely do not stereo-track the main channel of your simulation; I just moved kept moving forward. Looking back, it was pretty rude. Sorry Dr. Whiting and Dr. Sun.

A result of this ignorance was that important discussions were not being had. For example, does my assumption that digital logic simulation translates to audio synthesis nicely actually hold in practice?

It wasn't that long ago, yet I have more humility now towards programming than I did before. And part of that is because of the single, traumatic, refactor inducing realization I was about to have that semester. The answer to that question is No. No No No. Or, at least, not in the way that I thought.
## Harmonics
Digital logic is performed on bits. It was my understanding that audio synthesis is performed on bits, also. When bits are combined together, they can represent larger, denser numbers. With two bits, you can represent the whole numbers 0 through 4, or the integers -2 through 1. 

"Audio" is a high frequency sequence of "samples", numbers from 0 to 255. It is not their exact value, but rather their motion over time, which wiggles the fiddly stuff in your speaker or headphones fast enough to produce a recognizable tone. 

The important difference from digital logic is that the value of a single sample in a digital circuit matters a lot, while the value of a single sample in an audio synthesizer only matters in context. Digital logic puzzles are problems with a solutions. Synthesizers are closer to languages with grammars.

Failing to acknowledge this structure leads to the following issue. I was implementing an adder gate. The gate took the bits of one audio channel, and added it to another, sample by sample. It outputted a signal equal to the sum of each incoming pair of samples, plus an extra channel indicating if the sum "overflowed" over 255.

Intuitively, I believed this would have the effect of "mixing" the two signals together. But the result was an incomprehensible mess. I kept looking for bugs in my code, but there weren't any. The adder gate dutifully added the signals together.. as unsigned integers.

Firstly, the audio samples from 0 to 255 actually represent numbers from -128 to 127. These are positive and negative "pressure" values. You need negative and positive pressure to produce a wave. If you try to only use positive values, oscillating away and back towards zero, the oscillations will actually create negative pressure on their own when the positive values decrease towards zero, making your attempt at total positivity moot. To represent pressure more accurately, Audio signals are usually assumed to be "centered" at zero, ranging between a positive and negative value. 

Secondly, adding two audio streams together makes it louder. A lot louder. Measuring loudness can be done with a statistical method called the [RMSE](https://en.wikipedia.org/wiki/Root_mean_square_deviation) and a logarithmic transform. You can then divide by loudness to get a "normalized" signal. Suddenly adding two signals just got a whole lot more complicated. 

I ended up restructuring the entire simulator around working with *floating point* samples, which is a story for another day, but basically floating point is another representation of numbers that's more forgiving for dynamic audio processing tasks and supports automatic normalization in some contexts. 

Lesson learned is that audio synthesis is not like digital logic simulation. Just because two concepts are similar on paper doesn't mean they come out similar in code.
## OK With Imperfection
While fewer players got stuck with Moon Science than Lageta, the more experimental interface left more players walking away confused at what they had judt done or seen in the first place, even if they had done it successfully. 

It also runs like crap, and has a ton of bugs.

But I'm greatful I could put a wrap on the project before it crossed the one year mark. And, like Lageta, it was received well by testers, making it better than my high school projects. 
# Part 3. Conclusion

## More on Loops and Loop Detection
After college, I continued to have catastrophic project after catastrophic project. Maybe I'm catastrophizing, but I have a knack for getting into tech trouble in this way. 

Somewhere, somehow, I find myself up past midnight writing up something in some scripting language neither of us have heard of to achieve some completely inconherent goal. And that work will likely amount to very little.

Over and over again. 

Loop detected! What do we do? This isn't a videogame, we don't have to luxury of simply preventing things from happening in the first place.

Part of graduating from college was accepting that "coding" is not a job, or training for a job, or resume cred. Until I have the time *and* the patience to equip it with design documents and architecture plans and so on, it's at best a hobby. Hobbies are kind of like research, too. You don't have the protection of your institution or funding, but you have little, weird goals which, if documented well, can still be "results" and can still mark progress.

And once something is a hobby, you have the rest of your life to just enjoy it. I'm saving the stressful design documents and deadlines for when I really feel a deep need to actually make something. But when I just want to write, I can. Spread out over time, the infinite loop doesn't cause me to explode.
## Recommendations to Developers of Logic Games
Use novelty! Have weird shit it your game! Have little critters that come by at random and eat part of the circuit. Have a day night cycle that opens and closes certain levels. Have a dynamic music system that scales intensity off of the total resistance of the critical path of the circuit. Turrets, light bridges, and gel! Try stuff until something works. Because if your game is bland, it won't be fun and nobody will care. 

Tangentially, being educational is no excuse to not have a soul. I recently played a demo for a GPU Architecture game called [IT THINKS!](https://store.steampowered.com/app/5196330/IT_THINKS_Build_Your_Own_GPU/), which promises it will, on full release, provide a full learning pipeline from basic gates to GPU. Right now, the game looks like AI slop. And it really pains me to say that, because that doesn't mean there wasn't a lot of effort put into the game. After all, AI making software development easy is mostly an illusion pushed forward by people who have never actually "made" anything that couldn't have just been a couple github clones and a shell script. No, the experience I've played so far is surprisingly polished for a demo. I also really do believe in this game's mission and respect what the developers are doing. But..

![itthinks](media/itthinks.jpg)

Come on, guys. This is the most "Claude, make me a Zachtonics game" image I've ever seen. The bubbles, the grids.. And none of those buttons have sound, from what I could tell. There's no narrative context around your company in the game (that was a big strength of Shenzhen IO). Best of luck to all you in the agentic trenches.

Finally, don't forget that digital logic *in computing* is a subset of a larger, abstract theory of circuitry. You can go up to Boolean Algebras, up to Algebras, and down to Quantum Systems to make a game about quantum computing circuits like [Quantum Oddysey](https://www.quarksinteractive.com/quantum-odyssey). However, that game seems to only make things more difficult. If you can devise a set of states, gates, and rules for wiring thats more intuitive than how it works in real life, use that. Real life is complicated and weird. In math, we study whole numbers even though the real world is rarely so round. And when we get to high school, we're ready for functions on Real numbers, the decimals. Teaching people digital logic is not the same as throwing a bunch of gates in their face and asking them to solve puzzles. Tutoring has shown me the power of starting from a simpler problem and working up. And the process of finding intuitive abstractions of these difficult concepts for newcomers to the field is research worthy work indeed.

Screenshot of Quantum Odyssey: 

![quantum odyssey](media/quantumodyssey.jpg)



