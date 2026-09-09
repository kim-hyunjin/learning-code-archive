# 04. 제어문

## if / else

```cpp
int score = 85;

if (score >= 90) {
    std::cout << "A\n";
} else if (score >= 80) {
    std::cout << "B\n";
} else {
    std::cout << "C 이하\n";
}
```

## 삼항 연산자

간단한 조건부 대입은 `if/else`보다 삼항 연산자(`조건 ? 참일때 : 거짓일때`)가 더 간결합니다.

```cpp
int a = 7;
std::string parity = (a % 2 == 0) ? "짝수" : "홀수";
```

로직이 복잡해지면 오히려 가독성을 해치므로, 값 하나를 고르는 정도의 단순한 상황에만 쓰는 것이 좋습니다.

## switch

```cpp
int day = 3;
switch (day) {
    case 1:
        std::cout << "월요일\n";
        break;
    case 2:
        std::cout << "화요일\n";
        break;
    case 3:
        std::cout << "수요일\n";
        break;
    default:
        std::cout << "그 외\n";
        break;
}
```

`break`를 빼먹으면 다음 `case`로 실행이 그대로 이어지는데(**fall-through**), 이는 버그의 흔한 원인이지만 동시에 의도적으로 활용되기도 합니다.

```cpp
switch (day) {
    case 6:
    case 7: // 6, 7 둘 다 이 블록으로 들어옴 (break 없이 연달아 씀)
        std::cout << "주말\n";
        break;
    default:
        std::cout << "평일\n";
        break;
}
```

### enum과 함께 쓰는 switch

`switch`는 열거형과 궁합이 좋습니다. 컴파일러가 "모든 enum 값을 다 처리했는지"를 경고로 알려줄 수 있기 때문입니다.

```cpp
enum class Direction { North, South, East, West };

std::string toString(Direction dir) {
    switch (dir) {
        case Direction::North: return "북";
        case Direction::South: return "남";
        case Direction::East:  return "동";
        case Direction::West:  return "서";
    }
    return "알 수 없음"; // 모든 case를 다뤘다면 이 줄엔 도달하지 않음
}
```

## while / do-while

```cpp
int count = 0;
while (count < 3) {   // 조건을 먼저 검사 → 조건이 처음부터 거짓이면 한 번도 안 돌 수 있음
    std::cout << count << "\n";
    count++;
}

int retries = 0;
do {                    // 본문을 먼저 실행하고 나서 조건 검사 → 최소 한 번은 실행됨
    std::cout << "시도: " << retries << "\n";
    retries++;
} while (retries < 3);
```

`do-while`은 "일단 한 번은 실행해야 하는" 로직(예: 사용자 입력을 받고 유효성 검사가 실패하면 다시 묻기)에 적합합니다.

## for

```cpp
for (int i = 0; i < 5; ++i) {
    std::cout << i << " ";
}
// 0 1 2 3 4
```

`for`문의 세 부분(초기화, 조건, 증감식)은 모두 생략 가능합니다. 세 부분을 다 비우면 무한 루프가 됩니다.

```cpp
for (;;) {
    // break로 직접 빠져나가야 하는 무한 루프
}
```

## 범위 기반 for (range-based for)

컨테이너나 배열의 모든 원소를 순회할 때, 인덱스를 직접 관리할 필요 없이 사용할 수 있습니다.

```cpp
#include <vector>

std::vector<int> numbers = {1, 2, 3, 4, 5};

for (int n : numbers) {       // 원소를 복사해서 순회 (원본 수정 불가)
    std::cout << n << " ";
}

for (int& n : numbers) {      // 참조로 순회 (원본 수정 가능)
    n *= 2;
}

for (const int& n : numbers) { // 큰 객체를 복사 없이 읽기만 할 때 권장되는 형태
    std::cout << n << " ";
}
```

`int`처럼 작은 타입은 복사 비용이 거의 없지만, `std::string`이나 사용자 정의 클래스처럼 큰 객체를 순회할 때는 `const auto&`를 써서 불필요한 복사를 피하는 것이 좋은 습관입니다.

## 흔한 실수

- `for`문의 조건식에서 루프 변수를 잘못 비교해 하나 많거나 적게 도는 **off-by-one 오류**가 흔합니다. `i <= n`과 `i < n`을 혼동하지 않도록 주의해야 합니다.
- 범위 기반 for에서 값 타입(`int n`)으로 순회하면서 원소를 수정하려는 실수를 자주 합니다. 값 타입은 복사본이므로 원본에는 영향이 없습니다. 수정하려면 반드시 참조(`int&`)여야 합니다.
