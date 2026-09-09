# 15. 파일 입출력과 스트림

## 스트림이라는 공통 인터페이스

`std::cin`/`std::cout`이 콘솔과 데이터를 주고받는 스트림이었듯, 파일이나 문자열도 같은 방식(`<<`, `>>`)으로 다룰 수 있습니다. `<fstream>`은 파일 스트림을, `<sstream>`은 문자열 스트림을 제공합니다.

## 파일 쓰기: ofstream

```cpp
#include <fstream>

int main() {
    std::ofstream out("scores.txt"); // 파일을 쓰기 모드로 염 (없으면 생성, 있으면 덮어씀)

    if (!out.is_open()) {
        std::cout << "파일을 열 수 없습니다\n";
        return 1;
    }

    out << "Alice 90\n";
    out << "Bob 85\n";

    out.close(); // 명시적으로 닫아도 되고, out이 스코프를 벗어나면 소멸자가 자동으로 닫아줌
    return 0;
}
```

기존 내용에 이어서 쓰고 싶다면 `std::ios::app` 모드를 지정합니다.

```cpp
std::ofstream log("app.log", std::ios::app); // append 모드: 기존 내용 뒤에 이어씀
log << "새 로그 라인\n";
```

## 파일 읽기: ifstream

```cpp
#include <fstream>
#include <string>

int main() {
    std::ifstream in("scores.txt");

    if (!in.is_open()) {
        std::cout << "파일을 열 수 없습니다\n";
        return 1;
    }

    std::string name;
    int score;
    while (in >> name >> score) { // >>는 성공하면 스트림 자신을, 실패(EOF 포함)하면 실패 상태를 반환
        std::cout << name << ": " << score << "\n";
    }

    in.close();
    return 0;
}
```

`while (in >> name >> score)`처럼 스트림 추출을 조건식에 바로 쓰는 패턴이 자주 보입니다. 스트림 객체는 `bool`로 변환될 수 있고, 읽기에 실패하거나 파일 끝(EOF)에 도달하면 `false`가 되어 루프가 자연스럽게 끝납니다.

한 줄씩 통째로 읽으려면 `std::getline`을 씁니다.

```cpp
std::ifstream in("notes.txt");
std::string line;
while (std::getline(in, line)) {
    std::cout << "읽은 줄: " << line << "\n";
}
```

## 파일 복사 예시

읽기 스트림과 쓰기 스트림을 함께 쓰면 파일을 복사하는 로직도 간단하게 작성할 수 있습니다.

```cpp
#include <fstream>

bool copyFile(const std::string& srcPath, const std::string& dstPath) {
    std::ifstream src(srcPath);
    std::ofstream dst(dstPath);

    if (!src.is_open() || !dst.is_open()) {
        return false;
    }

    std::string line;
    while (std::getline(src, line)) {
        dst << line << "\n";
    }
    return true;
}
```

## stringstream: 문자열을 스트림처럼 다루기

`std::stringstream`은 메모리 상의 문자열을 파일처럼 읽고 쓸 수 있게 해줍니다. 문자열을 파싱하거나, 여러 타입의 값을 하나의 문자열로 합칠 때 유용합니다.

```cpp
#include <sstream>

// 문자열 파싱: "age:25" 형태를 분리
std::string input = "age:25";
std::stringstream ss(input);
std::string key;
int value;
std::getline(ss, key, ':'); // ':' 구분자까지 읽음 → key = "age"
ss >> value;                   // 나머지를 int로 읽음 → value = 25

// 여러 값을 하나의 문자열로 합치기
std::stringstream builder;
builder << "이름: " << "Alice" << ", 나이: " << 25;
std::string result = builder.str(); // "이름: Alice, 나이: 25"
```

숫자를 문자열로, 문자열을 숫자로 변환할 때도 종종 쓰입니다(다만 `std::to_string`, `std::stoi` 같은 전용 함수가 더 간단할 때가 많습니다).

## 스트림 조작자(manipulator)

`<iomanip>` 헤더는 출력 형식을 조정하는 조작자를 제공합니다.

```cpp
#include <iomanip>

double pi = 3.14159265;
std::cout << std::fixed << std::setprecision(2) << pi << "\n"; // 3.14 (소수점 2자리 고정)

std::cout << std::setw(10) << "id" << std::setw(10) << "score" << "\n"; // 각 필드 너비 10칸
std::cout << std::setw(10) << 1 << std::setw(10) << 95 << "\n";

std::cout << std::boolalpha << true << "\n";  // "true" (기본값은 "1")
std::cout << std::hex << 255 << "\n";          // ff (16진수로 출력)
```

`std::setw`는 **다음 출력 하나에만** 적용되고 초기화되는 반면, `std::fixed`/`std::setprecision`/`std::hex` 같은 것들은 별도로 되돌리기 전까지 계속 유지된다는 차이가 있습니다.

## 흔한 실수

- 파일을 열었는지(`is_open()`) 확인하지 않고 바로 읽고 쓰면, 파일이 없거나 권한이 없을 때 조용히 실패하고 아무 데이터도 오가지 않을 수 있습니다.
- `std::stringstream`을 재사용할 때 `.str("")`로 내용을 비웠더라도 **읽기/쓰기 위치와 에러 상태**는 그대로 남아있을 수 있습니다. 완전히 초기화하려면 `ss.clear()`도 함께 호출해야 합니다.
