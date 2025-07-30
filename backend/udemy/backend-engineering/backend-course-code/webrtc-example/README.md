# WebRTC Example

이 예제는 WebRTC(Web Real-Time Communication)를 사용하여 브라우저 간 직접 통신을 구현한 간단한 애플리케이션입니다. 비디오 통화와 텍스트 채팅 기능을 포함하고 있습니다.

## WebRTC란?

WebRTC는 웹 브라우저 간에 플러그인이나 추가 소프트웨어 없이 실시간 통신을 가능하게 하는 기술입니다. 주요 특징:

- 브라우저 간 P2P(Peer-to-Peer) 연결
- 오디오 및 비디오 스트리밍
- 데이터 채널을 통한 텍스트 및 파일 공유
- 낮은 지연 시간의 실시간 통신

## 기술 스택

- **프론트엔드**: HTML, CSS, JavaScript, WebRTC API
- **백엔드**: Node.js, Express
- **시그널링 서버**: Socket.IO

## 주요 기능

- 방 생성 및 참여
- 비디오 통화
- 오디오 음소거 및 비디오 끄기 기능
- 데이터 채널을 통한 실시간 채팅

## 설치 방법

1. 저장소를 클론하거나 다운로드합니다.
2. 프로젝트 디렉토리로 이동합니다:
   ```
   cd webrtc-example
   ```
3. 필요한 패키지를 설치합니다:
   ```
   npm install
   ```

## 실행 방법

1. 서버를 시작합니다:
   ```
   npm start
   ```
2. 웹 브라우저에서 다음 주소로 접속합니다:
   ```
   http://localhost:3000
   ```

## 사용 방법

1. 첫 번째 브라우저에서 방 ID를 입력하거나 비워두고 "Create Room" 버튼을 클릭합니다.
2. 생성된 방 ID를 확인합니다.
3. 두 번째 브라우저에서 같은 주소로 접속한 후, 첫 번째 브라우저에서 생성된 방 ID를 입력하고 "Join Room" 버튼을 클릭합니다.
4. 두 브라우저 간에 연결이 설정되면 비디오 통화가 시작됩니다.
5. 하단의 채팅 창을 통해 텍스트 메시지를 주고받을 수 있습니다.

## WebRTC 작동 원리

WebRTC 연결은 다음과 같은 단계로 이루어집니다:

1. **시그널링(Signaling)**: 두 피어가 서로를 찾고 연결하기 위한 정보를 교환합니다. 이 예제에서는 Socket.IO를 사용하여 시그널링 서버를 구현했습니다.

2. **ICE(Interactive Connectivity Establishment)**: 네트워크 연결을 설정하기 위한 프레임워크입니다. STUN 및 TURN 서버를 사용하여 NAT 및 방화벽을 통과할 수 있습니다.

3. **SDP(Session Description Protocol)**: 미디어 형식, 코덱, 연결 정보 등을 포함하는 메타데이터입니다. Offer와 Answer 형태로 교환됩니다.

4. **P2P 연결**: 시그널링이 완료되면 두 피어 간에 직접 연결이 설정되고, 미디어 스트림과 데이터가 교환됩니다.

## 주의사항

- 이 예제는 로컬 네트워크에서 잘 작동하지만, 인터넷을 통한 연결에는 TURN 서버가 필요할 수 있습니다.
- 보안을 위해 실제 프로덕션 환경에서는 HTTPS를 사용해야 합니다.
- 브라우저 호환성: 최신 버전의 Chrome, Firefox, Safari, Edge에서 지원됩니다.

## 참고 자료

- [WebRTC API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebRTC 공식 사이트](https://webrtc.org/)
- [Socket.IO 문서](https://socket.io/docs/)