const Mono = new Squid();

function loadMono() {
	const stories = [
		{
			linePause: 400,
			lines: [
				"Leaving home is hard. The world feels too real out there.",
				"So I hide and wait."
			],
			endPause: 1000,
		},
		{
			linePause: 300,
			lines: [
				"Maybe I should get a dog.",
				"Or a job. Some people like their jobs right?",
				"Maybe I should get a job and a dog."
			],
			endPause: 1000,
		}
	];

	let currentStoryIndex = 0;
	let currentLineIndex = 0;

	const currentStory = stories[currentStoryIndex];
	const currentLine = currentStory.lines[currentLineIndex];

	let storyOver = false;

	Mono.position = vec(Globals.halfWidth, Globals.halfHeight);
	Mono.line = currentLine;

	Mono.position = vec(0, Globals.sh - 50);

	Mono.listen("tick", () => {
		if(currentStoryIndex >= stories.length) {
			return;
		}

		if(storyOver) {
			if (Globals.tick % currentStory.endPause === 0) {
				storyOver = false;
				currentStoryIndex++;
				currentLineIndex = 0;

				console.log("Story over, moving to next story.");

				if(currentStoryIndex >= stories.length) {
					console.log("No more stories, waiting for next story.");
					Mono.line = "The End";
					return;
				}

				Mono.line = stories[currentStoryIndex].lines[currentLineIndex];
			}
		}
		else {
			if (Globals.tick % currentStory.linePause === 0) {
				currentLineIndex++;

				if (currentLineIndex >= currentStory.lines.length) {
					storyOver = true;
					console.log("Story over, waiting for next story.");
					Mono.line = "";
					return;
				}

				Mono.line = stories[currentStoryIndex].lines[currentLineIndex];
			}
		}
	})

	Mono.draw_priority(20);
	Mono.listen("draw", function () {
		draw_rect_filled(this.position.x, this.position.y, Globals.sw, 50, "black");
		draw_text(this.line, this.position.x + 20, this.position.y + 25, Globals.fonts.monospace, "left");
	});
};