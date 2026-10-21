---
title: gemm-opt
date: 2026-10-10
summary: fun little matrix multiply optimization project 
tags: personal, side-projects
draft: false
---

soooo i made something really cool to help myself learn how fast code actually gets fast. it's a project called **gemm-opt**, and it's about one operation: matrix multiplication (GEMM).

## why matrix multiply?

it's the core of machine learning. every transformer layer is mostly matrix multiplies, so making it faster makes both training and inference faster. it's also a great thing to learn from, because the math is easy but making it fast means using every part of the machine: caches, registers, vector units, multiple cores, and GPU threads.

## the goal

i didn't want to just make it faster, i wanted to know *why* it got faster. so every stage had to answer three questions: what bottleneck did this remove, what experiment shows it, and where does it stop helping?

i measured speed in **GFLOPS** (billions of math operations per second, higher is better), first on my M4 Pro CPU and then on a Tesla T4 GPU.

## the result

- **CPU:** 2.4 → 115 GFLOPS on one core (47x), then ~442 with all the cores
- **GPU:** 61.5 → 3,545 GFLOPS (57x), which is 94% of NVIDIA's own cuBLAS library

## how i got there

**CPU**

0. **Naive:** i just ran the triple loop. it goes down columns of B, so every cache line fetched only gives me 1 useful number, and each add waits on the one before it. **2.4 GFLOPS**
1. **Loop reorder (ikj):** i swapped the inner loops so it reads along rows. now i use the whole cache line, and the compiler uses NEON on its own. **32.7**
2. **Blocking + packing:** i worked on small tiles that fit in cache, then copied each tile into its own buffer so the tiles stop colliding in the cache. **41.9**
3. **NEON micro-kernel:** i kept a small 8x12 tile of C in registers, so i load 20 numbers and get 96 multiply-adds out of them. **115.3**
4. **OpenMP:** i split the work across CPU cores. barriers make threads wait for each other when they share data. **~442**

**GPU**

- **5a. Naive:** one thread per output, but the threads read memory all over the place. **61.5**
- **5b. Coalescing:** i changed which threads sit next to each other, so a warp reads 32 numbers in a row. **572.5**
- **5c. Shared memory:** i loaded tiles into fast shared memory so each number gets reused 32 times. **866**
- **5d. Register tiling:** each thread computes an 8x8 patch in registers, so there are fewer shared-memory reads per multiply-add. **3,545**

## what i learned

the same three ideas worked on both the CPU and the GPU: read memory in order, reuse data once it's loaded, and keep results in registers. the two biggest wins (13x on the CPU, 9x on the GPU) came from changing the order memory is read, with no change to the math at all.

i also learned that measuring is easy to get wrong. my GPU benchmark first showed a fake 7,000 GFLOPS because the card throttles itself once it heats up, and i only caught it by logging the clock speed.

