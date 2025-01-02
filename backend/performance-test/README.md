- 스트레스 테스스 툴 : Artillery
  - https://artillery.io/docs/guides/overview/welcome.html

- 도커
  - https://subicura.com/2017/02/10/docker-guide-for-beginners-create-image-and-deploy.html
  - https://subicura.com/2017/01/19/docker-guide-for-beginners-1.html

- postgresql
  ```
  # postgresql을 도커로 실행시키는 명령어
  docker run --name pgsql -d -p 5432:5432 -e POSTGRES_USER=postgresql -e POSTGRES_PASSWORD=postgrespassword postgres

  # postgresql-instance-1에서 실행해야할 명령어
  sudo yum install -y docker
  sudo systemctl start docker
  sudo chmod 666 /var/run/docker.sock
  docker run --name pgsql -d -p 5432:5432 -e POSTGRES_USER=postgresql -e POSTGRES_PASSWORD=postgrespassword postgres
  ```

- 젠킨스
  - https://gist.github.com/lleellee0/6c8fa84c5055c16125f00222cabc4d17
    ```
    # jenkins 인스턴스에서 실행하는 명령어 (한 줄씩 실행하면서 정상적으로 실행이 되고 있는지 꼭 확인해보세요)
    sudo yum install wget
    sudo yum install maven
    sudo yum install git
    sudo yum install docker

    sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
    sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
    sudo yum install jenkins
    sudo systemctl start jenkins
    sudo systemctl status jenkins

    # 여기까지 실행하면 설치는 완료

    sudo cat /var/lib/jenkins/secrets/initialAdminPassword
    ```

- nginx
  - https://gist.github.com/lleellee0/8e1be478178078e931dd3180f0f56d21
    ```
    # Docker 컨테이너를 실행시킬 준비가 되기 위해선 아래 명령어를 입력
    sudo yum install docker
    sudo systemctl start docker
    sudo chmod 666 /var/run/docker.sock


    # Nginx 인스턴스에서 다음 명령어로 세팅
    sudo yum install nginx
    sudo systemctl start nginx

    # 로드밸런싱 설정
    sudo vi /etc/nginx/nginx.conf
    # 위 명령어를 입력하여 nginx 설정 파일로 진입 후 다음과 같이 내용을 변경

    upstream cpu-bound-app {
      server {instance_1번의_ip}:8080 weight=100 max_fails=3 fail_timeout=3s;
      server {instance_2번의_ip}:8080 weight=100 max_fails=3 fail_timeout=3s;
      server {instance_3번의_ip}:8080 weight=100 max_fails=3 fail_timeout=3s;
    }

    location / {
      proxy_pass http://cpu-bound-app;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }

    # 위 설정이 완료되었으면 Nginx를 reload 시켜야함.
    sudo systemctl reload nginx

    # Nginx의 에러로그를 확인하기 위한 명령어
    sudo tail -f /var/log/nginx/error.log

    # 에러를 해결할 수 있는 명령어
    sudo setsebool -P httpd_can_network_connect on
    ```
  - https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/

- RabbitMQ
  - https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-amqp/2.4.1
    ```
    # RabbitMQ를 도커로 실행시키기 위한 명령어
    docker run -d --hostname my-rabbit --name some-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management
    ```
  
- ElasticSearch
  - https://gist.github.com/lleellee0/e4a5acdb9dbb4477b6d88943654303e2
    ```
    # ES 노드에서 실행해야 할 명령어
    # 1. 공통
    sudo yum install -y docker
    sudo systemctl start docker
    sudo chmod 666 /var/run/docker.sock

    sudo sysctl -w vm.max_map_count=262144

    # 2. 1번 노드에서만 실행시키는 명령어 (IP는 여러분의 인스턴스 IP를 적어주세요!!)
    docker network create somenetwork
    docker run -d --name elasticsearch --net somenetwork -p 9200:9200 -p 9300:9300 \
    -e "discovery.seed_hosts={1번 IP 빼고 나머지 3개 IP}" \
    -e "node.name=es01" \
    -e "cluster.initial_master_nodes=es01,es02,es03,es04" \
    -e "network.publish_host={1번 IP}" \
    elasticsearch:7.10.1

    # 3. 2번 노드에서 실행시키는 명령어
    docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 \
    -e "discovery.seed_hosts={2번 IP 빼고 나머지 3개 IP}" \
    -e "node.name=es02" \
    -e "cluster.initial_master_nodes=es01,es02,es03,es04" \
    -e "network.publish_host={2번 IP}" \
    elasticsearch:7.10.1
    ...
    ```
  - https://chrome.google.com/webstore/detail/elasticsearch-head/ffmkiejjmecolpfloofpjologoblkegm
