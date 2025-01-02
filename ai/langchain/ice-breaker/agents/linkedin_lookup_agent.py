from dotenv import load_dotenv

load_dotenv()

from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

from langchain_core.tools import Tool
from langchain.agents import create_react_agent, AgentExecutor
from langchain import hub
from tools.tools import get_profile_url_tavily


def lookup(name: str) -> str:
    """
    주어진 이름으로 링크드인 url 찾기
    """

    llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo")
    template = """
    given the full name {name_of_person} I want you to get it me a link a to their Linkedin profile page. 
    Your answer should contain only a URL
    """
    prompt_template = PromptTemplate(
        template=template, input_variables=["name_of_person"]
    )
    tools_for_agent = [
        Tool(
            name="Crawl Google for linkedin profile page",
            func=get_profile_url_tavily,
            description="useful for when you need get the Linkedin Page URL",
        )
    ]

    # LangChain hub의 hwchase17이 ReAct 논문을 구현한 프롬프트
    # react_prompt = hub.pull("hwchase17/react")
    # 위처럼 hub.pull을 사용하려면 LANGCHAIN_API_KEY가 필요.
    # 아래는 https://smith.langchain.com/hub/hwchase17/react?organizationId=a1544f4a-e5f5-5079-b95d-f570ffa0a416
    # 링크에서 가져온 hwchase17/react PromptTemplate
    react_template = """
    Answer the following questions as best you can. You have access to the following tools:

    {tools}

    Use the following format:

    Question: the input question you must answer
    Thought: you should always think about what to do
    Action: the action to take, should be one of [{tool_names}]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question

    Begin!

    Question: {input}
    Thought:{agent_scratchpad}
    """
    react_prompt = PromptTemplate(
        template=react_template,
        input_variables=["input", "agent_scratchpad", "tools", "tool_names"],
    )
    agent = create_react_agent(llm=llm, tools=tools_for_agent, prompt=react_prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools_for_agent, verbose=True)

    result = agent_executor.invoke(
        input={"input": prompt_template.format_prompt(name_of_person=name)}
    )

    linkedin_profile_url = result["output"]
    return linkedin_profile_url


if __name__ == "__main__":
    linkedin_url = lookup(name="Eden Macro")
    print(linkedin_url)
