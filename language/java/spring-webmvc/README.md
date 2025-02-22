# eomcs-spring-webmvc

Spring WebMVC 프레임워크 학습 예제

## src-01 : 웹 프로젝트 준비 

- HelloServlet 생성
- 서블릿 컨테이너에 배치 및 실행 테스트

## src-02 : 스프링 WebMVC 적용

- Spring Web MVC 라이브러리 추가
  - build.gradle 변경
- /WEB-INF/web.xml 파일 준비
  - 프론트 컨트롤러 역할을 수행할 스프링 webmvc 에서 제공하는 서블릿을 배치한다.
 `````````````
  <servlet>
    <servlet-name>app</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
      <param-name>contextConfigLocation</param-name>
      <param-value>/WEB-INF/app-context.xml</param-value>
    </init-param>
    <!-- 서블릿을 요청하지 않아도 웹 애플리케이션을 시작시킬 때 자동 생성되어 
         IoC 컨테이너를 준비하는 초기화 작업을 수행할 수 있도록 
         다음 옵션을 붙인다. -->
    <load-on-startup>1</load-on-startup>
  </servlet>
```````````````
- /WEB-INF/app-context.xml 파일 생성
  - Spring IoC 컨테이너 설정 파일
- HelloController 생성

## src-03 : IoC 설정 파일의 위치 

- /config/app-context.xml 로 위치 이동
  - 클라이언트가 자원을 가져갈 수 있는 경로에는 설정 파일을 두면 안된다.
  - WEB-INF 외 경로에 있는 자원은 클라이언트가 가져갈 수 있다.
  - 위와 같은 위치에 두면 위험하다.
- /WEB-INF/web.xml 변경

## src-04 : IoC 설정 파일의 위치 

- /WEB-INF/app-servlet.xml 로 위치 이동 및 이름 변경
- /WEB-INF/web.xml 변경
  - contextConfigLocation 초기화 파라미터 삭제
  - /WEB-INF/서블릿이름-servlet.xml 파일을 기본으로 찾는다.
  - 없으면 예외가 발생한다.
- DispatcherServlet에서 IoC컨테이너를 설정하기 싫다면,
  - contextConfigLocation 변수를 선언하지 않는다.
  - 변수를 선언하고 값만 지정하지 않는 경우 예외가 발생하진 않지만 동작하지 않는다.

## src-05 : ContextLoaderListener와 DispatcherServlet의 IoC 컨테이너

- /WEB-INF/config/app-context.xml 로 위치 이동 및 이름 변경
  - <mvc:annotation-driven/> 태그 추가 
  - ContextLoaderListener는 WebMVC 관련 애노테이션을 처리할 객체가 없기 때문에
    <mvc:annotation-driven/> 태그를 사용하여 별도로 등록해야 한다.
- /WEB-INF/web.xml 변경
  - ContextLoaderListener 추가
  - ContextLoaderListener가 사용할 contextConfigLocation 파라미터 설정
  - DispatcherServlet에 contextConfigLocation 초기화 파라미터 추가. 값은 빈채로 된다.

## src-06 : ContextLoaderListener와 DispatcherServlet의 관계

- ContextLoaderListener의 IoC 컨테이너
  - 모든 프론트 컨트롤러 및 페이지 컨트롤러가 공유할 객체를 보관한다.
- DispatcherServlet의 IoC 컨테이너
  - 페이지 컨트롤러, 인터셉터 등 웹 관련 객체를 보관한다.
- /WEB-INF/config/app-context.xml 변경
- /WEB-INF/app-servlet.xml 변경
- /WEB-INF/admin-servlet.xml 추가
- /WEB-INF/web.xml 변경

## src-07 : Java Config로 DispatcherServlet의 IoC 컨테이너 설정하기

- bitcamp.AppConfig 클래스 생성
- /WEB-INF/web.xml 변경

## src-08 : SerlvetContainerInitializer 구현체의 활용 

- Spring WebMVC의 WebApplicationInitializer를 이해하기 위한 기반 기술 소개.
- bitcamp-java-web-library 프로젝트 준비
  - 자세한 것은 해당 프로젝트의 README.md 파일을 읽어 볼 것.
- bitcamp-java-spring-webmvc/lib 폴더 생성
  - bitcamp-java-web-library.jar 파일 넣기
- build.gradle 에 lib 폴더에 있는 .jar 파일을 의존 라이브러리에 추가하기
- MyWebInitializerImpl 클래스 생성 
  - 이 클래스에서 DispatcherServlet 서블릿 등록하기 
- web.xml 변경
  - DispatcherServlet 배치 정보 삭제
  
## src-09 : WebApplicationInitializer 구현체를 통해 DispatcherServlet 등록하기

- build.gradle 변경 
  - 기존에 테스트를 위해 포함했던 bitcamp-java-web-library.jar 파일 제거
- WebApplicationInitializerImpl 생성
  - 직접 IoC 컨테이너 준비
  - DispatcherServlet 생성
  - ServletContext를 통해 배치 

## src-10 : WebApplicationInitializer 구현체를 통해 DispatcherServlet 등록하기 II

- WebApplicationInitializerImpl 변경
  - 직접 인터페이스를 구현하는 대신에 추상 클래스를 상속 받아 적절한 메서드를 오버라이딩 한다.
  - AbstractAnnotationConfigDispatcherServletInitializer 클래스 상속 받기
    - 이 클래스는 미리 AnnotationConfigWebApplicationContext IoC 컨테이너를 준비했다.
    - 따라서 IoC 컨테이너를 따로 설정할 필요가 없다.
    - 또한 DispatcherServlet을 등록하는 코드가 이미 작성되어 있기 때문에 따로 등록할 필요가 없다.
    - 즉 인터페이스를 직접 구현하는 것 보다 편하다.

## src-11 : WebApplicationInitializer 구현체를 통해 DispatcherServlet 등록하기 III

- WebApplicationInitializerImpl 변경
  - 직접 인터페이스를 구현하는 대신에 추상 클래스를 상속 받아 적절한 메서드를 오버라이딩 한다.
  - AbstractDispatcherServletInitializer 클래스를 상속 받기

## src-12 : Request Handler 정의하는 방법

- @Controller를 사용하여 페이지 컨트롤러 표시하기
- Request Handler의 아규먼트
- Request Handler의 리턴 타입과 View Resolver
- Request Handler의 URL @PathVariable 과  @MatrixVariable
- Request Handler의 @SessionAttributes와 @ModelAttribute
- 인터셉터 다루기
