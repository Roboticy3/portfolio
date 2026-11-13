---
layout: ../layouts/MarkdownLayout.astro
title: "Embed Styling"
description: "Media containment and inline style tests"
---

## Large image

![Large image](/media-content-test/pexels-photo-31284696-1530186307.jpg)

## Half-width image

<style="width:50%;">![Half-width image](/media-content-test/pexels-photo-31284696-1530186307.jpg)

## Half-width SVG

<style="width:50%;">![1](media-content-test/example.svg)

## Wide iframe

<iframe width="1200" height="675" src="https://www.youtube.com/embed/jNQXAC9IVRw" title="Containment test" allowfullscreen></iframe>

## Half-width iframe

<style="width:50%;"><iframe width="1200" height="675" src="https://www.youtube.com/embed/jNQXAC9IVRw" title="Styled containment test" allowfullscreen></iframe>

## Inline image

An inline image ![inline svg](/media-content-test/example.svg) sits inside this sentence.

## Inline styled image

An inline image <style="width:1.5em; vertical-align:middle;">![inline svg](/media-content-test/example.svg) sits inside this sentence.

## Inline iframe

An inline iframe <iframe width="160" height="90" src="https://www.youtube.com/embed/jNQXAC9IVRw" title="Inline iframe"></iframe> sits inside this sentence.

## Inline styled iframe

An inline iframe <style="width:160px; height:90px; vertical-align:middle;"><iframe width="160" height="90" src="https://www.youtube.com/embed/jNQXAC9IVRw" title="Inline styled iframe"></iframe> sits inside this sentence.
