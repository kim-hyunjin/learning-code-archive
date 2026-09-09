# 09. 복사와 이동 의미론

## 얕은 복사의 문제

클래스가 포인터(특히 동적으로 할당한 자원)를 멤버로 가지고 있을 때, 아무것도 정의하지 않으면 컴파일러는 **얕은 복사(shallow copy)**를 하는 기본 복사 생성자를 만들어줍니다. 얕은 복사는 포인터 값(주소) 자체만 복사하기 때문에, 두 객체가 같은 메모리를 가리키게 됩니다.

```cpp
class Buffer {
private:
    int* data;

public:
    Buffer(int size) : data(new int[size]) {}

    ~Buffer() {
        delete[] data; // 소멸자에서 자원을 해제
    }
    // 복사 생성자를 직접 정의하지 않음 → 컴파일러가 얕은 복사를 만들어줌
};

int main() {
    Buffer a(10);
    Buffer b = a; // 얕은 복사: b.data와 a.data가 같은 메모리를 가리킴
    return 0;
} // a, b 둘 다 소멸자가 호출되며 같은 메모리를 두 번 delete[] → 이중 해제, undefined behavior
```

## 깊은 복사

이 문제를 해결하려면 복사 생성자와 복사 대입 연산자를 직접 정의해서, 포인터가 가리키는 내용까지 새로 복사(**깊은 복사, deep copy**)해야 합니다.

```cpp
class Buffer {
private:
    int* data;
    int size;

public:
    Buffer(int s) : data(new int[s]), size(s) {}

    Buffer(const Buffer& other) : data(new int[other.size]), size(other.size) {
        for (int i = 0; i < size; ++i) {
            data[i] = other.data[i]; // 값을 하나하나 복사, 메모리 자체는 새로 할당됨
        }
    }

    Buffer& operator=(const Buffer& other) {
        if (this == &other) return *this; // 자기 자신에게 대입하는 경우 방지
        delete[] data;                       // 기존 자원 해제
        size = other.size;
        data = new int[size];
        for (int i = 0; i < size; ++i) {
            data[i] = other.data[i];
        }
        return *this;
    }

    ~Buffer() {
        delete[] data;
    }
};
```

이렇게 자원을 직접 관리하는 클래스는 소멸자, 복사 생성자, 복사 대입 연산자를 **함께** 정의해야 한다는 규칙을 "Rule of Three"라고 부릅니다. 셋 중 하나라도 필요하다면 나머지도 필요할 가능성이 높습니다.

## 이동 생성자와 이동 대입 연산자

깊은 복사는 안전하지만 값을 하나하나 복사하느라 비용이 큽니다. 임시 객체(더 이상 쓰이지 않을 값)라면 굳이 복사할 필요 없이, 자원의 소유권만 "이동"시키면 훨씬 저렴합니다. C++11부터는 **이동 생성자/이동 대입 연산자**로 이를 지원합니다.

```cpp
class Buffer {
private:
    int* data;
    int size;

public:
    Buffer(int s) : data(new int[s]), size(s) {}

    // 이동 생성자: 원본(other)의 자원을 훔쳐오고, 원본은 비워둔다
    Buffer(Buffer&& other) noexcept : data(other.data), size(other.size) {
        other.data = nullptr; // 원본이 소멸될 때 자원을 같이 해제하지 않도록 비움
        other.size = 0;
    }

    Buffer& operator=(Buffer&& other) noexcept {
        if (this == &other) return *this;
        delete[] data;          // 내가 가지고 있던 기존 자원은 해제
        data = other.data;      // 상대방 자원을 가져옴
        size = other.size;
        other.data = nullptr;   // 상대방은 빈 상태로 만듦
        other.size = 0;
        return *this;
    }

    ~Buffer() {
        delete[] data; // data가 nullptr이면 delete[]는 안전하게 아무 일도 하지 않음
    }
};

Buffer makeBuffer() {
    Buffer temp(100);
    return temp; // 반환되는 임시 객체 → 이동 생성자가 호출되어 복사 비용을 피함
}
```

`&&`는 **rvalue 참조**로, "곧 사라질, 재사용해도 되는 값"을 가리킵니다. 이동 생성자는 값을 복사하는 대신 포인터만 옮기고 원본을 비우기 때문에 `O(1)`에 가깝게 동작합니다. `noexcept`를 붙이는 이유는, 표준 라이브러리 컨테이너들이 "이동이 예외를 던지지 않는다"고 보장될 때만 복사 대신 이동을 최적화로 선택하기 때문입니다.

## 위임 생성자

생성자 여러 개가 비슷한 초기화 로직을 공유할 때, 한 생성자가 다른 생성자를 호출하도록 위임할 수 있습니다.

```cpp
class Rectangle {
private:
    double width, height;

public:
    Rectangle(double w, double h) : width(w), height(h) {}
    Rectangle() : Rectangle(1.0, 1.0) {} // 기본 생성자가 다른 생성자에게 위임
    Rectangle(double side) : Rectangle(side, side) {} // 정사각형
};
```

## const 멤버 함수

값을 읽기만 하고 객체 상태를 바꾸지 않는 멤버 함수는 `const`를 붙입니다. 이렇게 하면 `const` 객체에서도 호출할 수 있고, 실수로 상태를 바꾸는 코드를 컴파일 단계에서 막을 수 있습니다.

```cpp
class Point {
private:
    int x, y;

public:
    Point(int x_, int y_) : x(x_), y(y_) {}

    int getX() const { return x; }       // const: 이 함수는 멤버를 바꾸지 않음
    void setX(int newX) { x = newX; }     // non-const: 멤버를 바꿀 수 있음
};

void printX(const Point& p) {
    std::cout << p.getX(); // const 참조로 받았으므로 const 멤버 함수만 호출 가능
    // p.setX(10); // 컴파일 에러: const 객체에서 non-const 함수 호출 불가
}
```

## 흔한 실수

- 이동 생성자에서 원본 객체의 포인터를 `nullptr`로 비우는 것을 빼먹으면, 원본과 새 객체가 소멸될 때 같은 메모리를 두 번 해제하게 됩니다.
- 복사 대입 연산자에서 자기 자신을 대입하는 경우(`a = a;`)를 체크하지 않으면, 기존 자원을 해제한 뒤 그 해제된 자원을 다시 읽으려는 버그가 생길 수 있습니다.
