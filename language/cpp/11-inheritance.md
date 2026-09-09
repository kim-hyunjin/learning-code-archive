# 11. 상속

## 기본 상속

상속은 기존 클래스(베이스/부모 클래스)의 속성과 동작을 새 클래스(파생/자식 클래스)가 물려받는 것입니다. "A는 B의 한 종류다(is-a)" 관계일 때 사용합니다.

```cpp
class Animal {
protected:
    std::string name;

public:
    Animal(const std::string& n) : name(n) {}

    void eat() {
        std::cout << name << "가 먹는다\n";
    }
};

class Dog : public Animal {
public:
    Dog(const std::string& n) : Animal(n) {} // 베이스 클래스 생성자를 명시적으로 호출

    void bark() {
        std::cout << name << "가 짖는다\n"; // protected 멤버는 파생 클래스에서 접근 가능
    }
};

int main() {
    Dog d("바둑이");
    d.eat();  // 베이스 클래스에서 물려받은 함수
    d.bark(); // 파생 클래스에서 새로 추가한 함수
    return 0;
}
```

## 베이스 클래스 초기화

파생 클래스의 생성자는 반드시 베이스 클래스가 먼저 초기화된 뒤에 실행됩니다. 베이스 클래스 생성자가 인자를 필요로 한다면, 파생 클래스의 초기화 리스트에서 명시적으로 호출해야 합니다.

```cpp
class Dog : public Animal {
private:
    std::string breed;

public:
    Dog(const std::string& n, const std::string& b)
        : Animal(n), breed(b) {} // Animal(n)을 먼저 호출 → 그다음 breed 초기화
};
```

생성/소멸 순서는 항상 "베이스 → 파생" 순으로 생성되고, "파생 → 베이스" 순으로 소멸됩니다.

## protected 접근 제어자

`private` 멤버는 파생 클래스에서도 접근할 수 없습니다. 파생 클래스가 직접 다뤄야 하는 멤버는 `protected`로 선언합니다. 위 예시의 `name`이 `protected`이기 때문에 `Dog::bark()`에서 직접 쓸 수 있었습니다. `private`이었다면 `Animal`이 제공하는 `public`/`protected` 함수를 통해서만 접근할 수 있습니다.

## 베이스 클래스 메서드 재정의

파생 클래스는 베이스 클래스와 같은 이름의 함수를 새로 정의해서 동작을 바꿀 수 있습니다.

```cpp
class Animal {
public:
    void makeSound() {
        std::cout << "동물이 소리를 낸다\n";
    }
};

class Cat : public Animal {
public:
    void makeSound() { // Animal::makeSound()를 가림(hide)
        std::cout << "야옹\n";
    }
};

int main() {
    Cat c;
    c.makeSound();          // "야옹" — Cat의 버전이 호출됨
    c.Animal::makeSound();   // "동물이 소리를 낸다" — 명시적으로 베이스 버전 호출 가능
    return 0;
}
```

여기서 중요한 점은, 이건 **가상 함수가 아니므로** `Animal*` 포인터로 `Cat` 객체를 가리키면 여전히 `Animal::makeSound()`가 호출된다는 것입니다. "포인터 타입에 따라 어떤 함수가 호출될지가 정해지는" 이 문제와 그 해법(가상 함수)은 다음 장(12. 다형성)에서 다룹니다.

```cpp
Animal* ptr = new Cat();
ptr->makeSound(); // "동물이 소리를 낸다" — 기대와 다를 수 있음 (정적 바인딩)
delete ptr;
```

## private 상속과 protected 상속 (참고)

상속에는 `public` 외에도 `protected`, `private` 상속이 있지만, 실무에서는 거의 대부분 `public` 상속("is-a" 관계)을 사용합니다. `private` 상속은 "구현을 재사용하되 is-a 관계는 아니다"라는 특수한 상황에 쓰이며, 일반적으로는 상속 대신 멤버로 포함(composition)하는 것이 더 권장됩니다.

## 흔한 실수

- 상속은 "A는 B다"가 성립할 때만 써야 합니다. 단순히 코드를 재사용하고 싶어서 상속을 쓰면(예: `Stack`이 `Vector`를 상속) 관계가 없는 기능까지 노출되어 설계가 어색해집니다. 이런 경우엔 멤버로 포함하는 것이 더 적절합니다.
- 베이스 클래스의 생성자를 초기화 리스트에서 호출하지 않으면, 베이스 클래스의 기본 생성자가 자동으로 호출됩니다. 베이스 클래스에 기본 생성자가 없다면 컴파일 에러가 납니다.
