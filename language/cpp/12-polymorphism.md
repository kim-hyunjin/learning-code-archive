# 12. 다형성

## 문제 상황: 정적 바인딩

11장 마지막에서 봤듯, 일반 멤버 함수는 **포인터/참조의 선언된 타입**을 기준으로 어떤 함수를 호출할지 컴파일 타임에 정해집니다(정적 바인딩). 그래서 `Animal*`이 실제로는 `Cat` 객체를 가리키고 있어도, `Animal`의 함수가 호출됩니다. 다형성(polymorphism)은 이 문제를 해결해서 "실제 객체의 타입"에 따라 알맞은 함수가 호출되게 합니다.

## 가상 함수

`virtual` 키워드를 붙이면, 실제 객체의 타입을 보고 실행 시점에 어떤 함수를 호출할지 결정합니다(동적 바인딩).

```cpp
class Animal {
public:
    virtual void makeSound() {
        std::cout << "동물이 소리를 낸다\n";
    }

    virtual ~Animal() {} // 아래 "가상 소멸자" 참고
};

class Cat : public Animal {
public:
    void makeSound() override { // override 키워드로 "베이스의 가상 함수를 재정의함"을 명시
        std::cout << "야옹\n";
    }
};

class Dog : public Animal {
public:
    void makeSound() override {
        std::cout << "멍멍\n";
    }
};

void greet(Animal& animal) { // 베이스 클래스 참조로 받음
    animal.makeSound();       // 실제 타입에 맞는 함수가 호출됨
}

int main() {
    Cat cat;
    Dog dog;
    greet(cat); // "야옹"
    greet(dog); // "멍멍"
    return 0;
}
```

이렇게 하나의 인터페이스(`Animal&`)로 서로 다른 타입(`Cat`, `Dog`)을 동일하게 다루면서도 각자의 고유 동작이 실행되는 것이 다형성의 핵심입니다.

## override와 final

- `override`: 이 함수가 베이스 클래스의 가상 함수를 재정의한다고 명시합니다. 시그니처(이름, 매개변수, const 여부 등)가 베이스와 정확히 일치하지 않으면 컴파일 에러가 나므로, 오타나 실수를 컴파일 타임에 잡아줍니다.

```cpp
class Base {
public:
    virtual void run(int x) {}
};

class Derived : public Base {
public:
    void run(double x) override {} // 컴파일 에러: 시그니처가 다름(int vs double) → 재정의가 아님을 즉시 알 수 있음
};
```

- `final`: 이 함수는 더 이상 재정의할 수 없다고 못박거나, 이 클래스는 더 이상 상속할 수 없다고 못박습니다.

```cpp
class Cat : public Animal {
public:
    void makeSound() final { /* ... */ } // 이 함수는 여기서 재정의를 끝냄
};

class FinalClass final { /* ... */ }; // 이 클래스는 상속 불가능
```

## 순수 가상 함수와 추상 클래스 (인터페이스)

함수 몸체 대신 `= 0`을 붙이면 **순수 가상 함수**가 되며, 이를 하나라도 가진 클래스는 **추상 클래스**가 되어 직접 객체를 만들 수 없습니다. 자식 클래스가 반드시 구현해야 하는 "규약(인터페이스)"을 정의하는 용도로 씁니다.

```cpp
class Shape { // 추상 클래스: 인터페이스 역할
public:
    virtual double area() const = 0; // 순수 가상 함수: 몸체가 없다
    virtual ~Shape() {}
};

class Circle : public Shape {
private:
    double radius;

public:
    Circle(double r) : radius(r) {}

    double area() const override {
        return 3.14159 * radius * radius;
    }
};

int main() {
    // Shape s; // 컴파일 에러: 추상 클래스는 인스턴스화 불가
    Shape* shape = new Circle(5.0); // 포인터/참조로는 다룰 수 있음
    std::cout << shape->area() << "\n";
    delete shape;
    return 0;
}
```

여러 도형 타입을 하나의 컨테이너에 담아 다형적으로 처리하는 것이 추상 클래스의 대표적인 활용입니다.

```cpp
#include <vector>
#include <memory>

std::vector<std::unique_ptr<Shape>> shapes;
shapes.push_back(std::make_unique<Circle>(3.0));
// shapes.push_back(std::make_unique<Square>(4.0)); // 다른 도형도 같은 벡터에 담을 수 있음

for (const auto& s : shapes) {
    std::cout << s->area() << "\n"; // 각자의 area() 구현이 호출됨
}
```

## 가상 소멸자

베이스 클래스 포인터로 파생 클래스 객체를 `delete`할 때, 소멸자가 `virtual`이 아니면 **베이스 클래스의 소멸자만 호출**되고 파생 클래스 부분은 정리되지 않습니다.

```cpp
class Base {
public:
    ~Base() { std::cout << "Base 소멸\n"; } // virtual이 아님
};

class Derived : public Base {
private:
    int* data = new int[100];
public:
    ~Derived() {
        delete[] data;
        std::cout << "Derived 소멸\n";
    }
};

int main() {
    Base* b = new Derived();
    delete b; // "Base 소멸"만 출력됨 — Derived의 소멸자는 호출되지 않아 data가 누수됨
    return 0;
}
```

그래서 **다형적으로 사용될 가능성이 있는 베이스 클래스는 소멸자를 반드시 `virtual`로 선언**해야 합니다. 위 12장 첫 예시의 `Animal`에서 `virtual ~Animal() {}`을 넣어둔 이유가 이것입니다.

## 흔한 실수

- 다형적으로 쓰일 클래스에서 가상 소멸자를 빼먹는 것이 가장 흔한 실수입니다. "이 클래스가 상속될 가능성이 있는가?"를 기준으로 판단하면 됩니다.
- `override`를 붙이지 않고 재정의하면, 시그니처가 미묘하게 달라도(예: `const` 누락) 컴파일러가 경고 없이 "새로운 함수를 만든 것"으로 처리해버려 다형성이 깨진 채로 조용히 넘어갈 수 있습니다. 재정의할 때는 항상 `override`를 붙이는 것이 안전합니다.
