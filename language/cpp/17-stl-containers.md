# 17. STL 컨테이너

표준 템플릿 라이브러리(STL)는 자료구조를 직접 구현할 필요 없이 쓸 수 있도록 검증된 컨테이너들을 제공합니다. 어떤 연산이 잦은지에 따라 적합한 컨테이너가 달라집니다.

## std::array — 고정 크기 배열

크기가 컴파일 타임에 고정된, `std::vector`보다 가벼운 배열입니다. C 스타일 배열과 달리 크기 정보를 스스로 가지고 있고 경계 검사가 되는 `.at()`을 제공합니다.

```cpp
#include <array>

std::array<int, 5> arr = {1, 2, 3, 4, 5};
std::cout << arr.size() << "\n"; // 5, C 스타일 배열과 달리 스스로 크기를 앎
arr.at(10); // out_of_range 예외 발생
```

## std::vector — 동적 배열

05장에서 다뤘듯, 끝에서의 추가/삭제(`push_back`/`pop_back`)가 빠르고 인덱스 접근이 `O(1)`입니다. 중간 삽입/삭제는 뒤 원소들을 옮겨야 해서 `O(n)`입니다. **기본적으로 가장 먼저 고려하는 컨테이너**입니다.

## std::deque — 양쪽 끝 추가/삭제

"double-ended queue"의 줄임말로, 앞뒤 양쪽에서의 추가/삭제(`push_front`/`push_back`)가 모두 `O(1)`입니다. 벡터는 앞쪽에 추가하려면 전체를 밀어야 해서 느리지만, deque는 그렇지 않습니다.

```cpp
#include <deque>

std::deque<int> dq = {2, 3, 4};
dq.push_front(1); // {1, 2, 3, 4}
dq.push_back(5);  // {1, 2, 3, 4, 5}
dq.pop_front();     // {2, 3, 4, 5}
```

## std::list — 이중 연결 리스트

임의의 위치에 삽입/삭제가 `O(1)`(반복자를 이미 가지고 있다면)이지만, 인덱스로 임의 접근(`list[3]`)은 지원하지 않고 순차 접근만 가능합니다. "중간에 자주 삽입/삭제하지만 인덱스 접근은 필요 없는" 경우에 적합합니다.

```cpp
#include <list>

std::list<int> lst = {1, 2, 4};
auto it = std::next(lst.begin(), 2); // 세 번째 원소(4)를 가리키는 반복자
lst.insert(it, 3);                    // {1, 2, 3, 4}, 앞뒤 원소를 옮길 필요 없음
```

## std::stack — LIFO

마지막에 넣은 것이 먼저 나오는(Last-In-First-Out) 구조입니다. 실제로는 `deque` 위에 "push/pop/top만 허용하는" 제한된 인터페이스를 씌운 어댑터입니다.

```cpp
#include <stack>

std::stack<int> s;
s.push(1);
s.push(2);
s.push(3);
std::cout << s.top() << "\n"; // 3
s.pop();                        // 3 제거
std::cout << s.top() << "\n"; // 2
```

함수 호출 스택, 괄호 짝 검사, 실행 취소(undo) 기능 등에 자연스럽게 쓰입니다.

## std::queue — FIFO

먼저 넣은 것이 먼저 나오는(First-In-First-Out) 구조입니다.

```cpp
#include <queue>

std::queue<std::string> q;
q.push("첫번째 작업");
q.push("두번째 작업");
std::cout << q.front() << "\n"; // "첫번째 작업"
q.pop();
std::cout << q.front() << "\n"; // "두번째 작업"
```

작업 대기열, 너비 우선 탐색(BFS) 등에 쓰입니다.

## std::priority_queue — 항상 최댓값(또는 최솟값)이 맨 앞

내부적으로 힙(heap) 구조를 사용해, `push`/`pop`은 `O(log n)`이지만 항상 가장 큰(기본값 기준) 원소를 `O(1)`에 확인할 수 있습니다.

```cpp
#include <queue>

std::priority_queue<int> pq;
pq.push(3);
pq.push(1);
pq.push(4);
pq.push(1);

while (!pq.empty()) {
    std::cout << pq.top() << " "; // 4 3 1 1 — 항상 가장 큰 값부터 나옴
    pq.pop();
}
```

최솟값이 먼저 나오게 하려면 비교자를 바꿉니다.

```cpp
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;
```

## std::set — 정렬된 중복 없는 집합

원소를 자동으로 정렬된 상태로 유지하며, 중복을 허용하지 않습니다. 내부적으로 균형 이진 탐색 트리를 사용해 삽입/삭제/검색이 모두 `O(log n)`입니다.

```cpp
#include <set>

std::set<int> s = {3, 1, 4, 1, 5}; // 중복(1)은 하나만 남음
// 자동으로 정렬됨: {1, 3, 4, 5}

s.insert(2); // {1, 2, 3, 4, 5}
if (s.find(4) != s.end()) {
    std::cout << "4가 존재함\n";
}
```

## std::map — 정렬된 키-값 쌍

키를 기준으로 정렬된 상태를 유지하는 키-값 저장소입니다. 삽입/삭제/검색이 `O(log n)`입니다.

```cpp
#include <map>

std::map<std::string, int> ages;
ages["Alice"] = 30;      // 없으면 새로 만들고, 있으면 덮어씀
ages["Bob"] = 25;
ages.insert({"Carol", 28});

if (ages.find("Alice") != ages.end()) {
    std::cout << ages["Alice"] << "\n"; // 30
}

for (const auto& [name, age] : ages) { // 구조적 바인딩으로 키/값을 바로 꺼냄 (C++17)
    std::cout << name << ": " << age << "\n"; // 키(이름) 순으로 정렬되어 출력됨
}
```

`ages["없는키"]`처럼 `[]`로 존재하지 않는 키에 접근하면, 예외가 나는 게 아니라 **기본값으로 자동 생성**됩니다. 단순히 존재 여부만 확인하고 싶다면 `find()`나 `count()`를 써야 의도치 않은 원소 생성을 피할 수 있습니다.

## 컨테이너 선택 가이드

| 하고 싶은 것 | 적합한 컨테이너 |
|---|---|
| 인덱스로 빠르게 접근, 끝에서 추가/삭제 | `vector` |
| 양쪽 끝에서 추가/삭제 | `deque` |
| 중간 삽입/삭제가 잦음 | `list` |
| 되돌리기(LIFO) | `stack` |
| 대기열(FIFO) | `queue` |
| 항상 최댓값/최솟값 먼저 처리 | `priority_queue` |
| 중복 없는 정렬된 값 집합 | `set` |
| 키로 값을 찾는 정렬된 사전 | `map` |

## 흔한 실수

- `std::map`의 `[]` 연산자는 "읽기용"으로만 쓰다가도 존재하지 않는 키를 실수로 생성해버릴 수 있습니다. 단순 조회에는 `find`나 `at`을 쓰는 것이 안전합니다.
- `list`, `set`, `map`은 `vector`처럼 인덱스로 임의 접근(`container[3]`)할 수 없습니다. 자료 접근 패턴에 따라 컨테이너를 잘못 고르면 성능이 크게 나빠질 수 있습니다.
