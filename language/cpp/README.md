# C++ 학습 노트

C++ 강의를 들으며 다룬 개념들을 정리한 학습 노트입니다. 
아래 순서대로 읽으면 C++ 기초 문법부터 객체지향, 메모리 관리, 표준 라이브러리(STL)까지 이어지는 흐름을 따라갈 수 있습니다.

1. [01. 개발 환경과 첫 프로그램](./01-setup-and-first-program.md) — 컴파일 과정, 첫 프로그램, 주석, 기본 입출력
2. [02. 변수, 타입, 상수](./02-variables-types-and-constants.md) — 기본 타입, sizeof, 초기화, 전역 변수, const
3. [03. 연산자](./03-operators.md) — 산술/대입/관계/논리/증감 연산자와 흔한 실수
4. [04. 제어문](./04-control-flow.md) — if/switch/반복문, 삼항 연산자
5. [05. 배열과 벡터](./05-arrays-and-vectors.md) — C 스타일 배열, std::vector
6. [06. 문자열](./06-strings.md) — C 스타일 문자열 vs std::string
7. [07. 포인터, 참조, 메모리 관리](./07-pointers-references-and-memory.md) — 포인터, 참조, new/delete, 흔한 함정
8. [08. 클래스와 객체](./08-classes-and-objects.md) — 접근 제어자, 생성자/소멸자, static, friend
9. [09. 복사와 이동 의미론](./09-copy-and-move-semantics.md) — 얕은/깊은 복사, 복사 생성자, 이동 생성자
10. [10. 연산자 오버로딩](./10-operator-overloading.md) — 나만의 클래스에 연산자 붙이기
11. [11. 상속](./11-inheritance.md) — 베이스/파생 클래스, protected, 메서드 재정의
12. [12. 다형성](./12-polymorphism.md) — 가상 함수, 추상 클래스, override/final
13. [13. 스마트 포인터](./13-smart-pointers.md) — unique_ptr, shared_ptr, weak_ptr
14. [14. 예외 처리](./14-exception-handling.md) — try/catch/throw, 예외 클래스 계층
15. [15. 파일 입출력과 스트림](./15-file-io-and-streams.md) — ifstream/ofstream, stringstream, 조작자
16. [16. 템플릿](./16-templates.md) — 함수 템플릿, 클래스 템플릿
17. [17. STL 컨테이너](./17-stl-containers.md) — vector, array, deque, list, stack, queue, set, map
18. [18. 반복자와 알고리즘](./18-iterators-and-algorithms.md) — iterator, `<algorithm>`
19. [19. 열거형](./19-enumerations.md) — enum vs enum class
20. [20. 람다와 함수 객체](./20-lambdas-and-function-objects.md) — functor, 람다, STL 알고리즘과의 조합
21. [21. 전처리기와 매크로](./21-preprocessor-and-macros.md) — #define, 조건부 컴파일, 매크로의 대안

## 참고

- 모든 예제 코드는 개념 이해를 돕기 위해 직접 작성한 것으로, 실제 프로덕션 코드 스타일과는 다를 수 있습니다.
- 각 문서는 독립적으로 읽어도 이해되도록 작성했지만, 뒤로 갈수록 앞 개념(포인터, 클래스 등)을 전제로 합니다.
