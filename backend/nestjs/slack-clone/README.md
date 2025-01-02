# Slack Clone

using TypeScript, NestJs, TypeORM

## NestJS 장점

- 타입스크립트
- 필요한 기능을 많이 제공
- express의 미들웨어들도 사용 가능(NestJS 내부에서 express를 사용)
  - passport: 인증
  - morgan: 로깅
  - multer: 이미지  
    ...
- 모듈 단위로 나누어 코드를 구분하기 더 쉬움
- DI, AOP

## 세팅하기

```
$ npm i -g @nestjs/cli
$ nest new project-name
```

핫 리로딩 설정
https://docs.nestjs.com/recipes/hot-reload

## 도움되는 자료

https://slides.com/yariv-gilad/nest-js-request-lifecycle/fullscreen#/1
