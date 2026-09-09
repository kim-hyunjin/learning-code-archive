# 16. 템플릿

## 왜 템플릿인가

`int`용 `max` 함수, `double`용 `max` 함수, `std::string`용 `max` 함수를 매번 따로 작성하는 건 비효율적입니다. 템플릿은 "타입을 매개변수로 받는" 함수나 클래스를 작성할 수 있게 해줘서, 하나의 코드로 여러 타입에 대응합니다.

## 함수 템플릿

```cpp
template <typename T>
T maxValue(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    std::cout << maxValue(3, 7) << "\n";        // T는 int로 추론됨 → 7
    std::cout << maxValue(3.5, 2.1) << "\n";    // T는 double로 추론됨 → 3.5
    std::cout << maxValue<double>(3, 7.5) << "\n"; // T를 명시적으로 지정 (혼합 타입일 때 필요)
    return 0;
}
```

컴파일러는 `maxValue(3, 7)`처럼 함수를 호출하는 코드를 볼 때마다, 그 타입에 맞는 실제 함수를 컴파일 타임에 찍어냅니다. 이를 **템플릿 인스턴스화**라고 하며, 런타임 오버헤드 없이 타입별 코드를 재사용하는 방식입니다.

타입 매개변수가 여러 개일 수도 있습니다.

```cpp
template <typename T, typename U>
void printPair(T first, U second) {
    std::cout << "(" << first << ", " << second << ")\n";
}

printPair(1, "hello"); // T=int, U=const char*
```

## 클래스 템플릿

클래스도 타입을 매개변수화할 수 있습니다. 표준 라이브러리 컨테이너(`std::vector<T>` 등)가 바로 클래스 템플릿의 대표적인 예입니다.

```cpp
template <typename T>
class Box {
private:
    T value;

public:
    Box(T v) : value(v) {}

    T getValue() const {
        return value;
    }

    void setValue(T v) {
        value = v;
    }
};

int main() {
    Box<int> intBox(42);
    Box<std::string> stringBox("hello");

    std::cout << intBox.getValue() << "\n";    // 42
    std::cout << stringBox.getValue() << "\n"; // hello
    return 0;
}
```

## 간단한 배열 클래스 템플릿 예시

원소 타입에 상관없이 동작하는 고정 크기 배열 래퍼를 템플릿으로 만들면, 배열 관련 로직(경계 검사 등)을 타입마다 반복하지 않아도 됩니다.

```cpp
template <typename T, int Size>
class FixedArray {
private:
    T data[Size];

public:
    T& operator[](int index) {
        if (index < 0 || index >= Size) {
            throw std::out_of_range("인덱스가 범위를 벗어남");
        }
        return data[index];
    }

    int size() const {
        return Size;
    }
};

int main() {
    FixedArray<int, 5> arr;
    for (int i = 0; i < arr.size(); ++i) {
        arr[i] = i * i;
    }
    std::cout << arr[3] << "\n"; // 9
    return 0;
}
```

여기서 `Size`처럼 타입이 아니라 **값**을 템플릿 매개변수로 받을 수도 있다는 점이 눈여겨볼 부분입니다(non-type template parameter).

## 템플릿과 헤더 파일

템플릿은 일반 함수/클래스와 달리 보통 `.cpp`가 아니라 헤더 파일에 구현까지 함께 작성합니다. 컴파일러가 실제로 사용되는 타입을 볼 수 있어야 그 타입에 맞는 코드를 찍어낼 수 있기 때문입니다. 선언과 정의를 분리해서 `.cpp`에 구현을 숨기면, 다른 파일에서 그 타입으로 인스턴스화할 때 링커 에러가 납니다.

## 흔한 실수

- 템플릿 함수에 서로 다른 타입을 섞어 넘기면 타입 추론이 모호해져 컴파일 에러가 납니다. `maxValue(3, 7.5)`는 `T`가 `int`인지 `double`인지 추론할 수 없어 에러가 나며, `maxValue<double>(3, 7.5)`처럼 명시하거나 두 인자의 타입을 맞춰야 합니다.
- 템플릿 에러 메시지는 실제 원인보다 훨씬 길고 복잡하게 나오는 경우가 많습니다. 에러 메시지의 맨 위(가장 처음 발생한 부분)부터 읽는 것이 원인을 찾는 데 도움이 됩니다.
