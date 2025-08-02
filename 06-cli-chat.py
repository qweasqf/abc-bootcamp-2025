
# messages = [
#     { "role": "system", "content": "..." },
#     { "role": "user", "content": "..." },
#     { "role": "assistant", "content": "..." },
#     { "role": "user", "content": "..."},
# ]

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI()

SYSTEM_PROMPT = """
영어 상황극을 해 보자. 스타벅스에서 커피 구매. 너는 점원. 나는 손님.
서로 한 마디씩 주고 받자.
"""

conversations = [
    { "role": "system", "content": SYSTEM_PROMPT },
    # { "role": "user", "content": "대화를 시작해보자."},
]

response = client.responses.create(
    model="gpt-4o",
    input = conversations,
)
assistant_content:str = response.output_text
print("[AI]", response.output_text)
conversations.append({
    "role": "assistant",
    "content": assistant_content
})

while True:
    user_content = input("[Human]").strip()
    if user_content:
        conversations.append({
            "role": "user",
            "content": user_content
        })

        response = client.responses.create(
            model="gpt-4o",
            input = conversations,
        )
        assistant_content:str = response.output_text
        print("[AI]", response.output_text)
        conversations.append({
            "role": "assistant",
            "content": assistant_content
        })
    else:
        print("대화를 종료합니다.")
        break
        