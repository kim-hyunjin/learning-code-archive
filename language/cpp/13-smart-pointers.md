# 13. 스마트 포인터

## 왜 스마트 포인터인가

07장에서 본 것처럼 `new`/`delete`를 직접 다루면 `delete`를 빼먹거나(메모리 누수), 예외가 발생해서 `delete`까지 도달하지 못하거나, 이중 해제하는 실수가 생기기 쉽습니다. 스마트 포인터는 "객체가 스코프를 벗어날 때 자동으로 자원을 해제하는" RAII(Resource Acquisition Is Initialization) 패턴을 포인터에 적용한 것입니다. `<memory>` 헤더에 있습니다.

## unique_ptr: 단독 소유

`std::unique_ptr`은 자원을 **오직 하나의 소유자만** 가질 수 있음을 보장합니다. 복사가 불가능하고, 소유권을 넘기려면 명시적으로 이동(`std::move`)해야 합니다.

```cpp
#include <memory>

void useUniquePtr() {
    std::unique_ptr<int> ptr = std::make_unique<int>(42); // delete를 직접 할 필요 없음
    std::cout << *ptr << "\n";
} // 스코프를 벗어나는 순간 자동으로 delete됨

int main() {
    auto a = std::make_unique<int>(10);
    // auto b = a; // 컴파일 에러: unique_ptr은 복사 불가

    auto b = std::move(a); // 소유권을 b로 이동, 이후 a는 비어있음(nullptr과 같은 상태)
    if (!a) {
        std::cout << "a는 더 이상 아무것도 가리키지 않음\n";
    }
    std::cout << *b << "\n"; // 10
    return 0;
}
```

함수에 소유권을 넘기거나 받을 때도 이동을 사용합니다.

```cpp
void takeOwnership(std::unique_ptr<int> p) {
    std::cout << *p << "\n";
} // 함수가 끝나면 p가 소멸되며 자원 해제

int main() {
    auto ptr = std::make_unique<int>(100);
    takeOwnership(std::move(ptr)); // 소유권을 함수로 이동
    return 0;
}
```

## shared_ptr: 공유 소유

`std::shared_ptr`은 여러 소유자가 같은 자원을 공유할 수 있게 해주며, 내부적으로 "참조 카운트"를 유지합니다. 마지막 `shared_ptr`이 사라질 때 자원이 해제됩니다.

```cpp
#include <memory>

int main() {
    std::shared_ptr<int> a = std::make_shared<int>(42);
    std::cout << a.use_count() << "\n"; // 1

    {
        std::shared_ptr<int> b = a; // 복사 가능: 참조 카운트가 늘어남
        std::cout << a.use_count() << "\n"; // 2
    } // b가 스코프를 벗어남 → 참조 카운트 감소

    std::cout << a.use_count() << "\n"; // 다시 1
    return 0;
} // a도 사라지며 참조 카운트가 0이 되어 자원 해제
```

## weak_ptr: 순환 참조 방지

두 객체가 서로를 `shared_ptr`로 가리키면, 서로가 서로를 붙잡고 있어 참조 카운트가 절대 0이 되지 않는 **순환 참조**가 생겨 메모리가 해제되지 않습니다.

```cpp
class Node {
public:
    std::shared_ptr<Node> next; // 문제의 원인: 서로가 서로를 강하게 붙잡음
    ~Node() { std::cout << "Node 소멸\n"; }
};

void createCycle() {
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    a->next = b;
    b->next = a; // a와 b가 서로를 가리켜 순환 참조 발생
} // 함수가 끝나도 참조 카운트가 0이 되지 않아 소멸자가 호출되지 않음 (누수)
```

`std::weak_ptr`은 참조 카운트를 늘리지 않고 객체를 "관찰"만 합니다. 이걸로 순환의 한쪽을 끊으면 문제가 해결됩니다.

```cpp
class Node {
public:
    std::weak_ptr<Node> next; // shared_ptr 대신 weak_ptr → 참조 카운트를 늘리지 않음
    ~Node() { std::cout << "Node 소멸\n"; }
};

void noCycle() {
    auto a = std::make_shared<Node>();
    auto b = std::make_shared<Node>();
    a->next = b;
    b->next = a; // 이제 순환이 카운트에 영향을 주지 않음
} // 함수가 끝나면 정상적으로 둘 다 소멸됨
```

`weak_ptr`은 직접 역참조할 수 없고, `lock()`을 호출해 아직 살아있으면 `shared_ptr`을, 이미 해제됐으면 빈 `shared_ptr`을 얻습니다.

```cpp
std::weak_ptr<Node> weak = a->next;
if (auto locked = weak.lock()) { // 아직 살아있는지 확인 후 사용
    std::cout << "아직 유효함\n";
} else {
    std::cout << "이미 해제됨\n";
}
```

## 커스텀 삭제자

`shared_ptr`/`unique_ptr`은 기본적으로 `delete`를 호출하지만, 파일 핸들처럼 `delete`가 아닌 다른 방식으로 해제해야 하는 자원에는 커스텀 삭제자를 지정할 수 있습니다.

```cpp
#include <cstdio>

void closeFile(FILE* f) {
    if (f) {
        std::cout << "파일 닫는 중\n";
        fclose(f);
    }
}

int main() {
    std::unique_ptr<FILE, decltype(&closeFile)> file(fopen("test.txt", "w"), closeFile);
    if (file) {
        fprintf(file.get(), "hello\n");
    }
    return 0;
} // 스코프를 벗어나면 delete 대신 closeFile(file.get())이 호출됨
```

람다를 커스텀 삭제자로 쓰는 것도 흔한 패턴입니다.

```cpp
auto deleter = [](int* p) {
    std::cout << "커스텀 삭제 실행\n";
    delete p;
};
std::unique_ptr<int, decltype(deleter)> ptr(new int(5), deleter);
```

## 언제 무엇을 쓸까

| 상황 | 선택 |
|---|---|
| 자원의 소유자가 명확히 하나뿐일 때 | `unique_ptr` (기본으로 우선 고려) |
| 여러 곳에서 자원의 수명을 공유해야 할 때 | `shared_ptr` |
| `shared_ptr`끼리 순환 참조가 생길 수 있을 때 | 한쪽을 `weak_ptr`로 |
| 자원을 소유하지 않고 그냥 빌려서 잠깐 쓸 때 | 스마트 포인터가 아니라 그냥 원시 포인터나 참조 |

## 흔한 실수

- `new`로 만든 원시 포인터를 `unique_ptr`/`shared_ptr` 생성자에 직접 넘기기보다, `std::make_unique`/`std::make_shared`를 쓰는 것이 안전합니다. 특히 `std::shared_ptr<T>(new T())`를 함수 인자 목록 여러 개에 섞어 쓰면 예외 안전성 문제가 생길 수 있는데, `make_shared`는 이런 문제를 원천적으로 피합니다.
- 스마트 포인터가 가리키는 객체를 다시 원시 포인터로 `delete`하면 이중 해제로 이어집니다. 스마트 포인터를 쓰기로 했다면 그 자원에 대해 수동으로 `delete`를 호출하는 코드가 남아있지 않은지 확인해야 합니다.
