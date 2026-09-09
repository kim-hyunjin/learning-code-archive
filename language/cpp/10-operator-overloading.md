# 10. 연산자 오버로딩

## 왜 연산자를 오버로딩하는가

사용자 정의 타입도 내장 타입처럼 `+`, `==`, `<<` 같은 연산자를 자연스럽게 쓸 수 있게 해주는 기능입니다. 예를 들어 벡터(수학적 의미의) 클래스가 있다면, `v1.add(v2)`보다 `v1 + v2`가 더 직관적입니다.

이 장에서는 간단한 `Point` 클래스를 통해 대표적인 연산자 오버로딩 패턴을 살펴봅니다.

```cpp
class Point {
private:
    int x, y;

public:
    Point(int x_ = 0, int y_ = 0) : x(x_), y(y_) {}

    int getX() const { return x; }
    int getY() const { return y; }
```

## 산술 연산자 (`+`)

멤버 함수로 정의하면, 왼쪽 피연산자가 자동으로 `*this`가 됩니다.

```cpp
    Point operator+(const Point& other) const {
        return Point(x + other.x, y + other.y);
    }
```

```cpp
Point p1(1, 2);
Point p2(3, 4);
Point p3 = p1 + p2; // p1.operator+(p2) 와 동일, p3 = (4, 6)
```

## 비교 연산자 (`==`, `!=`)

```cpp
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }

    bool operator!=(const Point& other) const {
        return !(*this == other); // 이미 만든 연산자를 재사용
    }
```

## 대입 연산자 (`+=`)

복합 대입 연산자는 자기 자신을 수정하고, 체이닝(`a += b += c`)을 위해 자기 자신에 대한 참조를 반환하는 것이 관례입니다.

```cpp
    Point& operator+=(const Point& other) {
        x += other.x;
        y += other.y;
        return *this;
    }

}; // class Point 끝
```

## 스트림 삽입 연산자 (`<<`)

`std::cout << point`처럼 쓰려면 `operator<<`를 오버로딩해야 하는데, 왼쪽 피연산자가 `Point`가 아니라 `std::ostream`이므로 멤버 함수로는 만들 수 없습니다. 대신 **비멤버(전역) 함수**로 정의하고, `private` 멤버에 접근해야 한다면 `friend`로 선언합니다.

```cpp
class Point {
    // ... 위와 동일 ...
    friend std::ostream& operator<<(std::ostream& os, const Point& p);
};

std::ostream& operator<<(std::ostream& os, const Point& p) {
    os << "(" << p.getX() << ", " << p.getY() << ")";
    return os; // 스트림 참조를 반환해야 << 연산을 연달아 체이닝할 수 있음
}

int main() {
    Point p(3, 4);
    std::cout << "점: " << p << "\n"; // "점: (3, 4)"
    return 0;
}
```

## 실전 예시: 간단한 문자열 클래스

`std::string`이 내부적으로 어떻게 동작할지 감을 잡기 위해, 직접 만든 문자열 클래스에 핵심 연산자를 붙여봅니다. (실무에서는 `std::string`을 쓰지만, 연산자 오버로딩과 깊은 복사를 함께 연습하기 좋은 예시입니다.)

```cpp
class MyString {
private:
    char* buffer;
    int length;

public:
    MyString(const char* text) {
        length = strlen(text);
        buffer = new char[length + 1];
        strcpy(buffer, text);
    }

    MyString(const MyString& other) : length(other.length) { // 깊은 복사
        buffer = new char[length + 1];
        strcpy(buffer, other.buffer);
    }

    MyString& operator=(const MyString& other) {
        if (this == &other) return *this;
        delete[] buffer;
        length = other.length;
        buffer = new char[length + 1];
        strcpy(buffer, other.buffer);
        return *this;
    }

    ~MyString() {
        delete[] buffer;
    }

    MyString operator+(const MyString& other) const {
        char* combined = new char[length + other.length + 1];
        strcpy(combined, buffer);
        strcat(combined, other.buffer);
        MyString result(combined);
        delete[] combined;
        return result;
    }

    bool operator==(const MyString& other) const {
        return strcmp(buffer, other.buffer) == 0;
    }

    friend std::ostream& operator<<(std::ostream& os, const MyString& s) {
        os << s.buffer;
        return os;
    }
};
```

동적 자원을 가진 클래스에 연산자를 오버로딩할 때는 09장에서 다룬 깊은 복사, 이동 의미론 규칙이 그대로 적용됩니다.

## 흔한 실수

- 연산자를 오버로딩할 때 원래 연산자의 의미와 동떨어진 동작을 넣으면(예: `+`인데 실제로는 뺄셈을 함) 코드를 읽는 사람에게 혼란을 줍니다. "이 타입에서 자연스러운 의미"에 맞을 때만 오버로딩하는 것이 좋습니다.
- `operator<<`를 멤버 함수로 만들려고 하면 컴파일 에러가 납니다. 왼쪽 피연산자가 항상 `*this`가 되어야 하는데, `std::cout << obj`에서 왼쪽은 `std::cout`이지 `obj`가 아니기 때문입니다.
