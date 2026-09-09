---
title: "[C++ 학습 노트 18] 반복자와 알고리즘"
description: "반복자가 서로 다른 컨테이너를 공통 인터페이스로 순회하게 해주는 원리와 <algorithm>의 대표 함수, erase 중 반복자 무효화를 다루는 법을 정리합니다."
date: 2026-09-09
category: "Language"
categories:
  - Language
  - C++
tags:
  - C++
  - Iterators
  - Algorithms
summary: "vector, list, set처럼 서로 다르게 구현된 컨테이너를 반복자라는 공통 인터페이스로 순회하는 원리와 sort/find/accumulate 같은 <algorithm> 함수, erase 도중 반복자가 무효화되는 문제를 정리합니다."
---

17장에서 본 `vector`, `list`, `set`은 내부 구현이 완전히 다르지만, 반복자라는 공통 인터페이스 덕분에 같은 방식으로 순회할 수 있습니다. 이 글에서는 반복자의 기본 동작과 `<algorithm>` 헤더의 대표 함수들을 살펴보고, 순회 중 원소를 삭제할 때 흔히 겪는 반복자 무효화 문제를 다룹니다.

## 반복자란

반복자(iterator)는 컨테이너의 원소를 가리키며 "다음으로 이동"할 수 있는 객체로, 포인터와 비슷하게 동작합니다. `vector`, `list`, `set` 등 서로 완전히 다르게 구현된 컨테이너들도, 반복자라는 공통 인터페이스 덕분에 같은 방식으로 순회할 수 있습니다.

```cpp
#include <vector>

std::vector<int> nums = {10, 20, 30};

for (std::vector<int>::iterator it = nums.begin(); it != nums.end(); ++it) {
    std::cout << *it << " "; // 역참조로 값에 접근
}
// begin()은 첫 원소를, end()는 "마지막 원소의 다음"(원소가 없는 위치)을 가리킴
```

타입을 매번 길게 쓰는 대신 `auto`를 쓰는 것이 일반적입니다.

```cpp
for (auto it = nums.begin(); it != nums.end(); ++it) {
    std::cout << *it << " ";
}
```

사실 04장에서 다룬 범위 기반 for문(`for (int n : nums)`)이 내부적으로 하는 일이 바로 이 반복자 순회입니다. 반복자를 직접 다뤄야 하는 경우는, 순회 중 특정 위치에 원소를 삽입/삭제하거나 특정 위치를 가리키는 값 자체가 필요할 때입니다.

```cpp
auto it = nums.begin();
std::advance(it, 1);        // it을 1칸 이동 → 두 번째 원소를 가리킴
nums.insert(it, 15);          // 그 위치에 15를 삽입 → {10, 15, 20, 30}
```

## const_iterator

값을 읽기만 하고 수정하지 않을 거라면 `const_iterator`를 씁니다(또는 `cbegin()`/`cend()`).

```cpp
for (auto it = nums.cbegin(); it != nums.cend(); ++it) {
    // *it = 100; // 컴파일 에러: const_iterator를 통해서는 수정 불가
    std::cout << *it << " ";
}
```

## `<algorithm>` 헤더의 대표 함수들

반복자 두 개(시작, 끝)로 "범위"를 표현하는 것이 STL 알고리즘의 공통 패턴입니다. 이 덕분에 `<algorithm>`의 함수 하나가 벡터든 리스트든 배열이든 동일하게 동작합니다.

```cpp
#include <algorithm>
#include <vector>

std::vector<int> nums = {5, 3, 8, 1, 9, 2};

// 정렬
std::sort(nums.begin(), nums.end()); // {1, 2, 3, 5, 8, 9}

// 검색: 조건에 맞는 첫 원소를 가리키는 반복자를 반환, 없으면 end()
auto it = std::find(nums.begin(), nums.end(), 8);
if (it != nums.end()) {
    std::cout << "찾음: " << *it << "\n";
}

// 조건을 만족하는 원소 찾기
auto firstEven = std::find_if(nums.begin(), nums.end(), [](int n) { return n % 2 == 0; });

// 최댓값 / 최솟값
auto maxIt = std::max_element(nums.begin(), nums.end());
std::cout << "최댓값: " << *maxIt << "\n";

// 합계 (<numeric> 필요)
#include <numeric>
int sum = std::accumulate(nums.begin(), nums.end(), 0); // 0에서 시작해서 다 더함

// 모든 원소가 조건을 만족하는지
bool allPositive = std::all_of(nums.begin(), nums.end(), [](int n) { return n > 0; });

// 조건에 맞는 원소 개수
int count = std::count_if(nums.begin(), nums.end(), [](int n) { return n > 3; });

// 각 원소에 함수 적용
std::for_each(nums.begin(), nums.end(), [](int n) { std::cout << n * 2 << " "; });
```

## 범위 일부만 다루기

시작과 끝 반복자를 조절하면 컨테이너의 일부 구간만 대상으로 알고리즘을 적용할 수 있습니다.

```cpp
std::vector<int> nums = {1, 2, 3, 4, 5, 6};
std::sort(nums.begin(), nums.begin() + 3); // 앞 3개만 정렬
```

## 흔한 실수

- `end()`가 가리키는 위치는 "마지막 원소"가 아니라 "마지막 원소 다음"입니다. `*nums.end()`처럼 역참조하면 정의되지 않은 동작입니다.
- 반복 중인 컨테이너에 원소를 추가/삭제하면 반복자가 무효화될 수 있습니다(05장 `vector` 재할당 참고). 예를 들어 `vector`를 순회하며 `erase`를 반복하면, `erase`가 반환하는 새 반복자를 받아 갱신하지 않을 경우 다음 반복에서 무효화된 반복자를 참조하게 됩니다.

```cpp
for (auto it = nums.begin(); it != nums.end(); ) {
    if (*it % 2 == 0) {
        it = nums.erase(it); // erase는 삭제된 다음 원소를 가리키는 새 반복자를 반환
    } else {
        ++it;
    }
}
```

이전 글: [17. STL 컨테이너](./17-stl-containers.pub.md)

다음 글: [19. 열거형](./19-enumerations.pub.md)
