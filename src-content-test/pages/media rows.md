---
layout: ../layouts/MarkdownLayout.astro
title: "Media Rows"
description: "Two or more images on one line"
---

## Two identical images

Both should take 50% of the line width.

![Wide 1](/media-content-test/example.svg) ![Wide 2](/media-content-test/example.svg)

## Tall and wide

The wide image should get more width so both images have the same height.

![Tall](/media-content-test/tall.svg) ![Wide](/media-content-test/example.svg)

## Linked images

Links around images should not break the row.

[![Wide link](/media-content-test/example.svg)](/media/) [![Tall link](/media-content-test/tall.svg)](/media/)

## Mixed with text

With text present, images keep the existing inline behavior.

A wide image ![inline](/media-content-test/example.svg) in a sentence, followed by another ![inline 2](/media-content-test/example.svg).

## Explicitly sized image

A sized image opts out of automatic row sizing.

<style="width:25%;">![Quarter](/media-content-test/example.svg) ![Auto](/media-content-test/example.svg)
