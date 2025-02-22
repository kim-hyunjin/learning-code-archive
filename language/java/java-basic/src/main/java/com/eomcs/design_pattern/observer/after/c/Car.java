package com.eomcs.design_pattern.observer.after.c;

import java.util.ArrayList;
import java.util.List;

public class Car {

  // 관찰자의 객체 주소를 저장한다.
  List<CarObserver> observers = new ArrayList<>();


  // 자동차의 상태 변경을 보고받을 관찰자(Observer)를 등록한다.
  public void addCarObserver(CarObserver observer) {
    observers.add(observer);
  }

  // 자동차의 상태 변경을 보고받을 관찰자(Observer)를 제거한다.
  public void removeCarObserver(CarObserver observer) {
    observers.remove(observer);
  }
  public void start() {
    System.out.println("시동을 건다.");

    // 자동차의 시동을 걸면 등록된 관찰자들에게 알린다.
    for(CarObserver ob : observers) {
      ob.carStarted();
    }
  }

  public void run() {
    System.out.println("달린다.");
  }

  public void stop() {
    System.out.println("시동을 끈다.");

    // 자동차의 시동을 끄면,
    // 등록된 관찰자들에게 알린다.
    for(CarObserver ob : observers) {
      ob.carStopped();
    }

  }
}






