def generate_numbers_1(max_number: int):
    print("Generate_numbers_1 함수를 호출")
    numbers = []
    for i in range(1, max_number+1):
        numbers.append(i)
    return numbers

#Generator 객체를 생성하는 함수
def generate_numbers_2(max_number: int):
    print("Generate_numbers_2 함수를 호출")
    for i in range(1, max_number+1):
        yield i #return이 의미가 없어짐

numbers_1 = generate_numbers_1(10)
numbers_2 = generate_numbers_2(10)

print(numbers_1)
print(numbers_2)

# numbers = [1,2,3,4,5]
# [i**2 for i in numbers]

# gen1 = (i**2 for i in [1,2,3,4,5])

# def make_numbers():
#     for i in [1,2,3,4,5]:
#         yield i**2
# gen2 = make_numbers()
