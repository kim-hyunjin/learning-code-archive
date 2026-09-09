# 08. 클래스와 객체

## 클래스와 객체의 기본

클래스는 데이터(멤버 변수)와 그 데이터를 다루는 함수(멤버 함수)를 하나로 묶는 설계도입니다. 객체는 그 설계도로 실제 만들어낸 인스턴스입니다.

```cpp
class Rectangle {
public:
    double width;
    double height;

    double area() {
        return width * height;
    }
};

int main() {
    Rectangle rect;      // 객체 생성
    rect.width = 3.0;
    rect.height = 4.0;
    std::cout << rect.area() << "\n"; // 12
    return 0;
}
```

## 접근 제어자

`public`, `private`, `protected`는 클래스 외부에서 멤버에 접근할 수 있는지를 결정합니다.

- `public`: 클래스 밖에서 자유롭게 접근 가능
- `private`: 클래스 내부(멤버 함수)에서만 접근 가능
- `protected`: 자기 자신과 파생 클래스에서만 접근 가능 (11장 상속에서 다룸)

멤버 변수를 `private`으로 감추고, `public` 메서드(getter/setter)를 통해서만 접근하게 하는 것을 **캡슐화**라고 합니다. 외부에서 값을 함부로 바꾸지 못하게 막아, "이 클래스의 불변식(invariant)은 항상 이 함수들을 거쳐야만 깨지지 않는다"는 규칙을 강제할 수 있습니다.

```cpp
class BankAccount {
private:
    double balance;

public:
    void deposit(double amount) {
        if (amount > 0) { // 음수 입금 같은 잘못된 상태를 여기서 막을 수 있음
            balance += amount;
        }
    }

    double getBalance() const { // 값을 읽기만 하는 메서드는 const를 붙인다
        return balance;
    }
};
```

`class`와 `struct`는 문법상 거의 같지만, 기본 접근 제어자가 다릅니다(`class`는 기본 `private`, `struct`는 기본 `public`). 관례적으로 `struct`는 단순 데이터 묶음, `class`는 동작을 가진 객체에 씁니다.

## 생성자와 소멸자

생성자는 객체가 만들어질 때, 소멸자는 객체가 사라질 때 자동으로 호출됩니다.

```cpp
class Logger {
private:
    std::string name;

public:
    Logger(const std::string& n) : name(n) { // 생성자 초기화 리스트
        std::cout << "[" << name << "] 시작\n";
    }

    ~Logger() { // 소멸자: 이름 앞에 ~, 인자 없음, 반환 타입 없음
        std::cout << "[" << name << "] 종료\n";
    }
};

void doWork() {
    Logger log("작업A"); // 생성자 호출 → "[작업A] 시작"
    std::cout << "작업 중...\n";
} // 함수 끝, log가 스코프를 벗어나며 소멸자 자동 호출 → "[작업A] 종료"
```

### 생성자 초기화 리스트

멤버 변수는 생성자 본문(`{}`) 안에서 대입하는 것보다, 콜론(`:`) 뒤 초기화 리스트에서 초기화하는 것이 더 좋습니다. 본문에서 대입하면 "기본 생성 → 다시 대입"이라는 두 단계를 거치지만, 초기화 리스트는 처음부터 원하는 값으로 바로 생성하기 때문입니다. `const` 멤버나 참조 멤버는 대입이 불가능하므로 반드시 초기화 리스트를 써야 합니다.

```cpp
class Point {
private:
    const int x; // const 멤버는 초기화 리스트에서만 값을 줄 수 있음
    const int y;

public:
    Point(int x_, int y_) : x(x_), y(y_) {} // 본문에서 x = x_; 는 컴파일 에러
};
```

## 기본 생성자와 기본 인자

인자가 없는 생성자를 **기본 생성자**라고 합니다. 사용자가 어떤 생성자도 정의하지 않으면 컴파일러가 자동으로 만들어주지만, 하나라도 직접 정의하면 자동 생성은 사라집니다.

```cpp
class Config {
public:
    int retries;
    Config(int r = 3) : retries(r) {} // 기본값을 둔 생성자 하나로 기본 생성자 역할까지 겸함
};

Config c1;      // retries == 3
Config c2(5);   // retries == 5
```

## static 멤버

`static` 멤버는 객체마다 따로 갖는 것이 아니라, 클래스 전체가 공유하는 하나의 값/함수입니다.

```cpp
class Counter {
public:
    static int instanceCount; // 선언

    Counter() {
        instanceCount++;
    }
};

int Counter::instanceCount = 0; // 클래스 밖에서 정의(초기화)해야 함

int main() {
    Counter a, b, c;
    std::cout << Counter::instanceCount << "\n"; // 3, 객체가 아니라 클래스 이름으로 접근
    return 0;
}
```

`static` 멤버 함수는 특정 객체에 속하지 않으므로 `this`가 없고, 오직 `static` 멤버 변수/함수만 접근할 수 있습니다.

## friend

`friend`로 선언된 함수나 클래스는 해당 클래스의 `private` 멤버에도 접근할 수 있습니다. 캡슐화의 예외를 명시적으로 허용하는 것으로, 남용하면 캡슐화 자체가 무의미해지므로 정말 밀접하게 연관된 경우(예: 연산자 오버로딩)에만 신중히 사용합니다.

```cpp
class Box {
private:
    double volume;

public:
    Box(double v) : volume(v) {}
    friend void printVolume(const Box& b); // Box와 매우 밀접한 외부 함수
};

void printVolume(const Box& b) {
    std::cout << b.volume << "\n"; // private 멤버에 직접 접근 가능
}
```

## 흔한 실수

- 소멸자를 만들지 않아도 되는 클래스인데 습관적으로 빈 소멸자를 넣는 경우가 있습니다. 특별히 정리할 자원(동적 메모리, 파일 핸들 등)이 없다면 컴파일러가 만들어주는 기본 소멸자로 충분합니다.
- getter/setter를 모든 멤버에 기계적으로 만드는 것은 캡슐화가 아니라 오히려 캡슐화를 무력화시킵니다. "이 값을 외부에서 자유롭게 읽고 써도 되는가"를 먼저 고민해야 합니다.
