---
title: "[C++ 학습 노트 14] 예외 처리"
description: "try/catch/throw 기본 흐름, 사용자 정의 예외 클래스 계층, catch 순서, 스택 언와인딩과 rethrow 패턴을 정리합니다."
date: 2026-09-09
category: "Language"
categories:
  - Language
  - C++
tags:
  - C++
  - ExceptionHandling
summary: "예외 계층에서 구체적인 타입을 먼저 catch해야 하는 이유, 스택 언와인딩 중 지역 객체 소멸자가 호출되는 원리, 예외를 값이 아닌 참조로 잡아야 하는 이유를 정리합니다."
---

예외는 정상적인 흐름으로는 처리할 수 없는 오류 상황을 호출자에게 알리는 방법입니다. 이 글에서는 `try`/`catch`/`throw`의 기본 흐름부터, 사용자 정의 예외 계층을 설계하는 관례, 그리고 13장에서 다룬 스마트 포인터가 예외 상황에서도 자원을 안전하게 해제해주는 이유(스택 언와인딩)까지 다룹니다.

## try / catch / throw 기본

예외는 "정상적인 흐름으로는 처리할 수 없는 오류 상황"을 호출자에게 알리는 방법입니다. `throw`로 예외를 던지고, `try` 블록으로 감싼 코드에서 발생한 예외를 `catch`로 잡습니다.

```cpp
double divide(double a, double b) {
    if (b == 0) {
        throw std::runtime_error("0으로 나눌 수 없습니다");
    }
    return a / b;
}

int main() {
    try {
        double result = divide(10, 0);
        std::cout << result << "\n"; // 예외가 발생하면 이 줄은 실행되지 않음
    } catch (const std::runtime_error& e) {
        std::cout << "에러 발생: " << e.what() << "\n";
    }
    std::cout << "프로그램은 계속 진행됨\n";
    return 0;
}
```

`throw`가 실행되면 그 시점에서 함수 실행이 즉시 중단되고, 이 예외를 처리할 수 있는 가장 가까운 `catch` 블록을 찾아 스택을 거슬러 올라갑니다.

## 사용자 정의 예외 클래스

표준 라이브러리는 `<stdexcept>`에 `std::exception`을 루트로 하는 예외 클래스 계층을 제공합니다. 직접 예외 타입을 만들 때는 이 계층을 상속해서, `what()`을 오버라이드하는 것이 관례입니다.

```cpp
#include <stdexcept>
#include <string>

class InsufficientFundsException : public std::runtime_error {
public:
    InsufficientFundsException(double shortage)
        : std::runtime_error("잔액이 " + std::to_string(shortage) + "만큼 부족합니다") {}
};

class BankAccount {
private:
    double balance = 0;

public:
    void withdraw(double amount) {
        if (amount > balance) {
            throw InsufficientFundsException(amount - balance);
        }
        balance -= amount;
    }
};

int main() {
    BankAccount account;
    try {
        account.withdraw(100);
    } catch (const InsufficientFundsException& e) {
        std::cout << e.what() << "\n";
    }
    return 0;
}
```

## 예외 계층과 catch 순서

여러 `catch` 블록을 둘 때는 **더 구체적인(파생) 타입을 먼저, 더 일반적인(베이스) 타입을 나중에** 배치해야 합니다. 반대로 하면 파생 클래스 예외도 먼저 나오는 베이스 클래스 `catch`에 잡혀버려, 뒤에 있는 구체적인 `catch` 블록은 절대 실행되지 않습니다.

```cpp
try {
    account.withdraw(100);
} catch (const InsufficientFundsException& e) { // 구체적인 타입을 먼저
    std::cout << "잔액 부족: " << e.what() << "\n";
} catch (const std::runtime_error& e) { // 더 일반적인 타입을 나중에
    std::cout << "런타임 에러: " << e.what() << "\n";
} catch (...) { // 모든 예외를 잡는 catch-all, 타입을 알 수 없을 때의 최후 수단
    std::cout << "알 수 없는 예외 발생\n";
}
```

## 여러 종류의 예외를 함수 하나에서 던지기

```cpp
double calculateMpg(double miles, double gallons) {
    if (gallons <= 0) {
        throw std::invalid_argument("연료량은 0보다 커야 합니다");
    }
    if (miles < 0) {
        throw std::invalid_argument("주행 거리는 음수일 수 없습니다");
    }
    return miles / gallons;
}
```

## 스택 언와인딩과 예외 안전성

예외가 던져지면, `catch`에 도달할 때까지 거쳐가는 모든 스코프의 지역 객체들의 소멸자가 순서대로 호출됩니다. 이를 **스택 언와인딩(stack unwinding)**이라고 합니다. 스마트 포인터(13장)를 쓰면 예외가 발생해도 자원이 자동으로 해제되는 이유가 바로 이것입니다.

```cpp
class Tracer {
private:
    std::string name;
public:
    Tracer(const std::string& n) : name(n) { std::cout << name << " 시작\n"; }
    ~Tracer() { std::cout << name << " 정리\n"; } // 예외가 나도 반드시 호출됨
};

void risky() {
    Tracer t("risky 함수");
    throw std::runtime_error("문제 발생");
    // 이 아래 코드는 실행되지 않지만, t의 소멸자는 스택 언와인딩 중에 반드시 호출됨
}

int main() {
    try {
        risky();
    } catch (const std::exception& e) {
        std::cout << "잡음: " << e.what() << "\n";
    }
    return 0;
}
// 출력 순서: "risky 함수 시작" → "risky 함수 정리" → "잡음: 문제 발생"
```

만약 자원을 스마트 포인터가 아니라 원시 포인터(`new`)로 관리하고 있었다면, 예외가 발생해 `delete`까지 도달하지 못하고 함수를 빠져나가면서 메모리가 누수됩니다. 예외를 던질 가능성이 있는 코드에서는 자원 관리를 RAII(스마트 포인터 등)에 맡기는 것이 중요한 이유입니다.

## 재던지기 (rethrow)

`catch` 블록에서 예외를 일부만 처리하고, 나머지 처리는 더 바깥의 호출자에게 넘기고 싶을 때 `throw;`(인자 없이)로 같은 예외를 다시 던질 수 있습니다.

```cpp
void logAndRethrow() {
    try {
        divide(1, 0);
    } catch (const std::runtime_error& e) {
        std::cout << "로그 기록: " << e.what() << "\n"; // 로깅만 하고
        throw; // 원래 예외를 그대로 다시 던져서 바깥에서도 처리하게 함
    }
}
```

## 흔한 실수

- `catch (const std::exception& e)`처럼 값이 아니라 **참조**로 받아야 합니다. 값으로 받으면 예외 객체가 복사되는 과정에서 파생 클래스의 정보가 잘려나가는 **슬라이싱(slicing)** 문제가 생길 수 있습니다.
- 예외를 "당연히 일어날 수 있는 일반적인 흐름 제어"에 쓰는 것은 권장되지 않습니다. 예외는 비용이 크고(스택 언와인딩), "정말 예외적인 상황"에만 쓰는 것이 좋습니다. 반복문 안에서 값이 없는 걸 표현하려면 예외보다 `std::optional`이나 반환값 검사가 더 적합할 때가 많습니다.

이전 글: [13. 스마트 포인터](./13-smart-pointers.pub.md)

다음 글: [15. 파일 입출력과 스트림](./15-file-io-and-streams.pub.md)
