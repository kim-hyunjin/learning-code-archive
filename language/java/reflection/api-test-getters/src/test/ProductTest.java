/*
 *  MIT License
 *
 *  Copyright (c) 2020 Michael Pogrebinsky - Java Reflection - Master Class
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

package test;

import api.ClothingProduct;
import api.Product;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.*;

/**
 * API Test - Getters
 * https://www.udemy.com/course/java-reflection-master-class
 */
public class ProductTest {

    public static void main(String[] args) {
        testGetters(Product.class);
        testSetters(Product.class);
        testGetters(ClothingProduct.class);
        testSetters(ClothingProduct.class);
    }

    public static void testGetters(Class<?> dataClass) {
        List<Field> fields = getAllFields(dataClass);

        Map<String, Method> methodNameToMethod = mapMethodNameToMethod(dataClass);

        for (Field field : fields) {
            String getterName = "get" + capitalizeFirstLetter(field.getName());

            if (!methodNameToMethod.containsKey(getterName)) {
                throw new IllegalStateException(String.format("Field : %s doesn't have a getter method", field.getName()));
            }

            Method getter = methodNameToMethod.get(getterName);

            if (!getter.getReturnType().equals(field.getType())) {
                throw new IllegalStateException(
                        String.format("Getter method : %s() has return type %s but expected %s",
                                getter.getName(),
                                getter.getReturnType().getTypeName(),
                                field.getType().getTypeName()));
            }

            if (getter.getParameterCount() > 0) {
                throw new IllegalStateException(String.format("Getter : %s has %d arguments", getterName));
            }
        }
    }

    public static void testSetters(Class<?> dataClass) {
        List<Field> fields = getAllFields(dataClass);

        for (Field field : fields) {
            String setterName = "set" + capitalizeFirstLetter(field.getName());

            Method setterMethod = null;
            try {
                setterMethod = dataClass.getMethod(setterName, field.getType());
            } catch (NoSuchMethodException e) {
                throw new IllegalStateException(String.format("Setter: %s not found", setterName));
            }

            if (!setterMethod.getReturnType().equals(void.class)) {
                throw new IllegalStateException(String.format("Setter method: %s has no return void", setterName));
            }
        }

    }

    /**
     * 현재 클래스와 부모 클래스의 모든 필드를 조회하는 메소드(public 여부와 상관없이)
     * 이런식으로 getDeclared**() 을 부모에 대해서 재귀로 사용하면 필드, 메서드, 생성자 모두 public 여부와 상관없이 모두 가져올 수 있다.
     */
    private static List<Field> getAllFields(Class<?> clazz) {
        if (clazz == null || clazz.equals(Object.class)) {
            return Collections.emptyList();
        }

        Field[] currentClassFields = clazz.getDeclaredFields(); // 현재 클래스에 선언된 모든 필드 가져오기(public 여부와 상관없이)
        List<Field> inheritedFields = getAllFields(clazz.getSuperclass()); // 부모에 대해서 재귀로 가져오기

        List<Field> allFields = new ArrayList<>();
        allFields.addAll(Arrays.asList(currentClassFields));
        allFields.addAll(inheritedFields);

        return allFields;
    }

    private static String capitalizeFirstLetter(String fieldName) {
        return fieldName.substring(0, 1).toUpperCase().concat(fieldName.substring(1));
    }

    private static Map<String, Method> mapMethodNameToMethod(Class<?> dataClass) {
        Method[] allMethods = dataClass.getMethods();

        Map<String, Method> nameToMethod = new HashMap<>();

        for (Method method : allMethods) {
            nameToMethod.put(method.getName(), method);
        }

        return nameToMethod;
    }
}
