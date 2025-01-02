// Mybatis - SQL에 파라미터 지정하기 : ${}
package com.eomcs.mybatis.ex02;

import java.io.InputStream;
import java.util.List;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

public class Exam0222 {

  public static void main(String[] args) throws Exception {
    InputStream inputStream =
        Resources.getResourceAsStream("com/eomcs/mybatis/ex02/mybatis-config05.xml");
    SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(inputStream);

    SqlSession sqlSession = factory.openSession();

    List<Board> list = sqlSession.selectList("BoardMapper.selectBoard3", "where title like '%oh%'");

    for (Board board : list) {
      System.out.printf("%d, %s, %s, %s, %d\n", board.getNo(), board.getTitle(), board.getContent(),
          board.getRegisteredDate(), board.getViewCount());
    }

    sqlSession.close();
  }

}


