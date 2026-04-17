import os
from typing import Dict, List

import nbformat as nbf

ROOT = os.path.join(os.getcwd(), "Data Science")

COURSE_STRUCTURE: Dict[str, List[str]] = {
    "01_Introduction_to_Data_Science": [
        "01_What_is_Data_Science.ipynb",
        "02_Data_Science_Lifecycle.ipynb",
        "03_Tools_and_Ecosystem.ipynb",
        "04_Ethics_and_Careers.ipynb",
    ],
    "02_Python_for_Data_Science": [
        "01_Python_Basics.ipynb",
        "02_Data_Structures.ipynb",
        "03_Functions_and_Modules.ipynb",
        "04_NumPy_Foundations.ipynb",
        "05_Python_Mini_Project.ipynb",
    ],
    "03_Data_Analysis_with_Pandas": [
        "01_Pandas_Basics.ipynb",
        "02_Data_Cleaning.ipynb",
        "03_GroupBy_and_Aggregation.ipynb",
        "04_Merging_and_Time_Series.ipynb",
        "05_Pandas_Mini_Project.ipynb",
    ],
    "04_Data_Visualization": [
        "01_Matplotlib_Basics.ipynb",
        "02_Seaborn_for_Insights.ipynb",
        "03_Storytelling_with_Data.ipynb",
        "04_Dashboard_Style_Reporting.ipynb",
    ],
    "05_SQL_and_Databases": [
        "01_SQL_Fundamentals.ipynb",
        "02_Joins_and_Aggregations.ipynb",
        "03_SQL_with_Python.ipynb",
        "04_SQL_Mini_Project.ipynb",
    ],
    "06_Statistics_and_Probability": [
        "01_Descriptive_Statistics.ipynb",
        "02_Probability_Basics.ipynb",
        "03_Hypothesis_Testing.ipynb",
        "04_Confidence_Intervals_and_AB_Testing.ipynb",
    ],
    "07_Machine_Learning": [
        "01_ML_Workflow.ipynb",
        "02_Supervised_Learning.ipynb",
        "03_Model_Evaluation.ipynb",
        "04_Unsupervised_Learning.ipynb",
        "05_ML_Mini_Project.ipynb",
    ],
    "08_Data_Projects": [
        "01_EDA_Project.ipynb",
        "02_Visualization_Project.ipynb",
        "03_Simple_ML_Project.ipynb",
        "04_Portfolio_Packaging.ipynb",
    ],
    "09_Capstone_Project": [
        "01_Capstone_Problem_Definition.ipynb",
        "02_Capstone_Execution_Guide.ipynb",
        "03_Capstone_Evaluation_Rubric.ipynb",
        "04_Capstone_Presentation.ipynb",
    ],
}


def make_standard_notebook(module_name: str, notebook_name: str) -> nbf.NotebookNode:
    title = notebook_name.replace(".ipynb", "").replace("_", " ")
    project_focus = "Mini-project" if "Project" in notebook_name else "Practice"

    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell(
            f"# {title}\n\n"
            f"**Module:** {module_name}\n\n"
            "This notebook is designed for hands-on learning in an IBM-aligned data science journey."
        ),
        nbf.v4.new_markdown_cell(
            "## Learning Objectives\n"
            "By the end of this notebook, you should be able to:\n"
            "- Explain core concepts in your own words\n"
            "- Apply them using Python and data tools\n"
            "- Interpret outputs and make practical decisions\n"
            "- Complete exercises and a challenge task"
        ),
        nbf.v4.new_markdown_cell(
            "## Concept Explanation (Simple → Deep)\n"
            "1. **Simple:** Start with intuitive definitions and plain-language examples.\n"
            "2. **Applied:** Connect the concept to data tasks (cleaning, analysis, visualization, modeling).\n"
            "3. **Deep:** Discuss trade-offs, limitations, and best practices used by industry teams."
        ),
        nbf.v4.new_code_cell(
            "# Core imports for this course\n"
            "import numpy as np\n"
            "import pandas as pd\n"
            "import matplotlib.pyplot as plt\n"
            "import seaborn as sns\n"
            "\n"
            "from sklearn.model_selection import train_test_split\n"
            "from sklearn.metrics import accuracy_score, mean_squared_error\n"
            "\n"
            "np.random.seed(42)\n"
            "sns.set_theme(style='whitegrid')"
        ),
        nbf.v4.new_markdown_cell(
            "## Real-World Dataset / Simulated Dataset\n"
            "Use one of the following in this notebook:\n"
            "- Local file in `Data Science/datasets/`\n"
            "- Public CSV (e.g., government open data)\n"
            "- Simulated dataset generated with NumPy/Pandas"
        ),
        nbf.v4.new_code_cell(
            "# Example simulated dataset\n"
            "rows = 200\n"
            "df = pd.DataFrame({\n"
            "    'customer_id': np.arange(1, rows + 1),\n"
            "    'monthly_spend': np.random.normal(120, 35, rows).round(2),\n"
            "    'sessions': np.random.poisson(10, rows),\n"
            "    'churn': np.random.binomial(1, 0.25, rows)\n"
            "})\n"
            "df.head()"
        ),
        nbf.v4.new_markdown_cell("## Data Cleaning Task"),
        nbf.v4.new_code_cell(
            "# Insert missing values for practice\n"
            "df.loc[df.sample(frac=0.05, random_state=42).index, 'monthly_spend'] = np.nan\n"
            "\n"
            "# Cleaning example\n"
            "df['monthly_spend'] = df['monthly_spend'].fillna(df['monthly_spend'].median())\n"
            "df.isna().sum()"
        ),
        nbf.v4.new_markdown_cell("## Visualization Task"),
        nbf.v4.new_code_cell(
            "plt.figure(figsize=(8, 4))\n"
            "sns.histplot(df['monthly_spend'], kde=True, bins=25)\n"
            "plt.title('Distribution of Monthly Spend')\n"
            "plt.xlabel('Monthly Spend')\n"
            "plt.ylabel('Count')\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            f"## {project_focus} Task\n"
            "Scenario: You are a junior data scientist supporting a business team.\n"
            "- Define one business question\n"
            "- Identify useful features\n"
            "- Produce at least one chart and one insight\n"
            "- Recommend one next action"
        ),
        nbf.v4.new_markdown_cell(
            "## Practice Exercises\n"
            "1. Create two additional features from existing columns.\n"
            "2. Compare group means for a target metric.\n"
            "3. Build a simple baseline model (where relevant).\n"
            "4. Explain one risk of misinterpreting the data."
        ),
        nbf.v4.new_markdown_cell(
            "## Challenge Task\n"
            "Design a small end-to-end workflow:\n"
            "- Data ingestion\n"
            "- Cleaning\n"
            "- Analysis/Modeling\n"
            "- Communication of results\n"
            "\n"
            "Deliverable: a concise findings summary suitable for a portfolio project README."
        ),
        nbf.v4.new_markdown_cell(
            "## Summary\n"
            "In this notebook, you worked from fundamentals to practical application.\n"
            "You are expected to save outputs, reflect on decisions, and iterate like a real data scientist."
        ),
    ]
    return nb


def make_project_notebook(notebook_name: str) -> nbf.NotebookNode:
    title = notebook_name.replace(".ipynb", "").replace("_", " ")

    scenario_map = {
        "01_EDA_Project.ipynb": "Analyze supermarket transaction behavior and identify drivers of weekly revenue.",
        "02_Visualization_Project.ipynb": "Create an executive-ready visualization story for city transportation usage.",
        "03_Simple_ML_Project.ipynb": "Build a baseline model to predict telecom customer churn.",
        "04_Portfolio_Packaging.ipynb": "Package your project into a hiring-manager-ready portfolio artifact.",
    }

    nb = make_standard_notebook("08_Data_Projects", notebook_name)
    nb.cells.insert(
        3,
        nbf.v4.new_markdown_cell(
            "## Project Brief\n"
            f"**Scenario:** {scenario_map.get(notebook_name, 'Solve a practical business analytics problem.')}\n\n"
            "### Deliverables\n"
            "- Business question and success metric\n"
            "- Cleaned dataset and reproducible code\n"
            "- Visual narrative for non-technical stakeholders\n"
            "- Final recommendation with risks and next steps"
        ),
    )

    if notebook_name == "01_EDA_Project.ipynb":
        nb.cells.extend([
            nbf.v4.new_markdown_cell(
                "## EDA Project Tasks\n"
                "1. Profile data quality (nulls, duplicates, outliers).\n"
                "2. Build 5+ visuals across univariate and bivariate analysis.\n"
                "3. Segment customers/products and summarize key behavior patterns."
            ),
            nbf.v4.new_markdown_cell(
                "## Challenge Task\n"
                "Propose two experiments the business can run next month and define success metrics."
            ),
        ])
    elif notebook_name == "02_Visualization_Project.ipynb":
        nb.cells.extend([
            nbf.v4.new_markdown_cell(
                "## Visualization Project Tasks\n"
                "1. Build a visual story with beginning-middle-end structure.\n"
                "2. Use color and annotation intentionally for executive clarity.\n"
                "3. Include one misleading chart example and correct it."
            ),
            nbf.v4.new_markdown_cell(
                "## Challenge Task\n"
                "Create two versions of the same findings: one for executives and one for operations teams."
            ),
        ])
    elif notebook_name == "03_Simple_ML_Project.ipynb":
        nb.cells.extend([
            nbf.v4.new_code_cell(
                "# Baseline ML workflow template\n"
                "from sklearn.model_selection import train_test_split\n"
                "from sklearn.linear_model import LogisticRegression\n"
                "from sklearn.metrics import classification_report, confusion_matrix\n"
                "\n"
                "X = df[['monthly_spend', 'sessions']]\n"
                "y = df['churn']\n"
                "\n"
                "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n"
                "model = LogisticRegression(max_iter=500)\n"
                "model.fit(X_train, y_train)\n"
                "pred = model.predict(X_test)\n"
                "print(classification_report(y_test, pred))\n"
                "print(confusion_matrix(y_test, pred))"
            ),
            nbf.v4.new_markdown_cell(
                "## Challenge Task\n"
                "Tune one model hyperparameter and compare metrics before/after. Explain which metric matters most for the business case."
            ),
        ])
    else:
        nb.cells.extend([
            nbf.v4.new_markdown_cell(
                "## Portfolio Checklist\n"
                "- Problem framing in plain language\n"
                "- Clean reproducible notebook\n"
                "- README with visuals and key insights\n"
                "- Reflection: what you would improve with more time"
            ),
        ])

    return nb


def make_capstone_notebook(notebook_name: str) -> nbf.NotebookNode:
    title = notebook_name.replace(".ipynb", "").replace("_", " ")
    nb = nbf.v4.new_notebook()

    common_intro = [
        nbf.v4.new_markdown_cell(
            f"# {title}\n\n"
            "**Module:** 09_Capstone_Project\n\n"
            "This capstone module transforms your learning into a portfolio-ready, real-world project."
        ),
        nbf.v4.new_markdown_cell(
            "## Learning Objectives\n"
            "- Define a business-relevant data science problem\n"
            "- Plan and execute an end-to-end project workflow\n"
            "- Communicate impact, limitations, and next actions\n"
            "- Evaluate quality with a professional rubric"
        ),
    ]

    if notebook_name == "01_Capstone_Problem_Definition.ipynb":
        cells = common_intro + [
            nbf.v4.new_markdown_cell(
                "## Real-World Problem Definition\n"
                "**Problem:** A telecom company has rising customer churn and wants to proactively retain at-risk users.\n"
                "\n"
                "### Business Goal\n"
                "Reduce churn by 10% over two quarters while preserving marketing efficiency.\n"
                "\n"
                "### Data Science Goal\n"
                "Build a churn risk segmentation solution and identify key behavioral drivers of churn."
            ),
            nbf.v4.new_markdown_cell(
                "## Dataset Suggestions\n"
                "- IBM Telco Customer Churn dataset\n"
                "- Bank Marketing dataset\n"
                "- E-commerce subscription retention data (public/open)\n"
                "- Simulated SaaS churn dataset in `Data Science/datasets/`"
            ),
            nbf.v4.new_markdown_cell(
                "## Practice Exercises\n"
                "1. Rewrite the problem statement for healthcare or education.\n"
                "2. Define at least 3 measurable success metrics.\n"
                "3. Identify bias and fairness risks in the available features."
            ),
            nbf.v4.new_markdown_cell(
                "## Challenge Task\n"
                "Draft a one-page project charter with scope, constraints, and expected impact."
            ),
            nbf.v4.new_markdown_cell(
                "## Summary\n"
                "A strong capstone starts with sharp problem framing, realistic constraints, and measurable outcomes."
            ),
        ]
    elif notebook_name == "02_Capstone_Execution_Guide.ipynb":
        cells = common_intro + [
            nbf.v4.new_markdown_cell(
                "## Step-by-Step Project Guidance\n"
                "1. Frame the problem and define stakeholders.\n"
                "2. Acquire and document data sources.\n"
                "3. Perform cleaning and feature engineering.\n"
                "4. Conduct exploratory analysis and identify hypotheses.\n"
                "5. Build baseline and improved models (if predictive).\n"
                "6. Evaluate with technical + business metrics.\n"
                "7. Communicate recommendations with visuals.\n"
                "8. Define deployment and monitoring plan."
            ),
            nbf.v4.new_code_cell(
                "# Capstone workflow starter\n"
                "import pandas as pd\n"
                "\n"
                "# Example: load your dataset\n"
                "# df = pd.read_csv('../datasets/your_dataset.csv')\n"
                "\n"
                "print('Replace this cell with your capstone data-loading logic.')"
            ),
            nbf.v4.new_markdown_cell(
                "## Practice Exercises\n"
                "- Create a milestone plan with weekly checkpoints.\n"
                "- Define risks and fallback strategies for each stage.\n"
                "- Specify what would count as project failure and why."
            ),
            nbf.v4.new_markdown_cell(
                "## Challenge Task\n"
                "Create a reproducible project timeline that can be executed by another teammate without clarification calls."
            ),
            nbf.v4.new_markdown_cell(
                "## Summary\n"
                "Execution quality determines capstone credibility: reproducibility, clarity, and stakeholder alignment matter as much as modeling."
            ),
        ]
    elif notebook_name == "03_Capstone_Evaluation_Rubric.ipynb":
        cells = common_intro + [
            nbf.v4.new_markdown_cell(
                "## Evaluation Criteria (100 points)\n"
                "- Problem framing and business relevance: **15**\n"
                "- Data quality handling and feature design: **20**\n"
                "- EDA depth and insight quality: **15**\n"
                "- Modeling/statistical rigor: **20**\n"
                "- Communication and visualization clarity: **15**\n"
                "- Reproducibility and code quality: **10**\n"
                "- Reflection, limitations, and next steps: **5**"
            ),
            nbf.v4.new_markdown_cell(
                "## Performance Bands\n"
                "- **Outstanding (90–100):** clear business impact, robust methods, and professional communication\n"
                "- **Strong (75–89):** sound workflow with minor gaps\n"
                "- **Developing (60–74):** partial execution, weak linkage between analysis and decisions\n"
                "- **Needs Work (<60):** major reproducibility or reasoning gaps"
            ),
            nbf.v4.new_markdown_cell(
                "## Challenge Task\n"
                "Self-assess your capstone using this rubric, then list top 3 upgrades to move one performance band higher."
            ),
            nbf.v4.new_markdown_cell(
                "## Summary\n"
                "Use this rubric as both grading criteria and a quality checklist before publishing your portfolio project."
            ),
        ]
    else:
        cells = common_intro + [
            nbf.v4.new_markdown_cell(
                "## Capstone Presentation Guidance\n"
                "Recommended deck flow:\n"
                "1. Business context and problem\n"
                "2. Data and methodology\n"
                "3. Key findings\n"
                "4. Recommendations and expected impact\n"
                "5. Limitations and future work"
            ),
            nbf.v4.new_markdown_cell(
                "## Practice Exercises\n"
                "- Prepare a 5-minute executive pitch and a 12-minute technical walkthrough.\n"
                "- Create one slide that translates metrics into financial/business impact."
            ),
            nbf.v4.new_markdown_cell(
                "## Challenge Task\n"
                "Record a mock presentation and critique clarity, confidence, and evidence quality."
            ),
            nbf.v4.new_markdown_cell(
                "## Summary\n"
                "A capstone is complete only when insights are understandable, actionable, and persuasive to real stakeholders."
            ),
        ]

    nb.cells = cells
    return nb


def make_full_intro_notebook() -> nbf.NotebookNode:
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell(
            "# 01 What is Data Science?\n\n"
            "Welcome to your first notebook in the **IBM-aligned Data Science learning track**.\n"
            "This lesson introduces what data science is, why it matters, and how professionals solve real-world problems using data."
        ),
        nbf.v4.new_markdown_cell(
            "## Learning Objectives\n"
            "By the end of this notebook, you will be able to:\n"
            "- Define data science and distinguish it from related fields\n"
            "- Explain the end-to-end data science workflow\n"
            "- Identify common tools and roles on a data team\n"
            "- Explore a small business dataset with Python\n"
            "- Perform basic cleaning and visualization\n"
            "- Propose actionable recommendations from analysis"
        ),
        nbf.v4.new_markdown_cell(
            "## Concept Explanation (Simple → Deep)\n"
            "### 1) Simple View\n"
            "Data science is the practice of using data to answer questions and guide decisions.\n"
            "\n"
            "### 2) Practical View\n"
            "A data scientist collects and prepares data, explores it, builds models, and communicates insights to stakeholders.\n"
            "\n"
            "### 3) Professional View\n"
            "In real organizations, data science combines statistics, software engineering, domain knowledge, and communication. Success is measured by business impact, not only model accuracy."
        ),
        nbf.v4.new_markdown_cell(
            "## Where Data Science Is Used\n"
            "- Healthcare: predict patient risk and improve treatment pathways\n"
            "- Finance: detect fraud and score credit risk\n"
            "- Retail: forecast demand and personalize recommendations\n"
            "- Education: identify learners who need support\n"
            "- Public sector: improve service delivery and policy planning"
        ),
        nbf.v4.new_markdown_cell(
            "## The Core Workflow\n"
            "1. Problem framing\n"
            "2. Data collection\n"
            "3. Data cleaning and preparation\n"
            "4. Exploratory data analysis (EDA)\n"
            "5. Modeling/statistical analysis\n"
            "6. Evaluation\n"
            "7. Communication and deployment\n"
            "8. Monitoring and iteration"
        ),
        nbf.v4.new_code_cell(
            "# Core imports for this notebook\n"
            "import numpy as np\n"
            "import pandas as pd\n"
            "import matplotlib.pyplot as plt\n"
            "import seaborn as sns\n"
            "\n"
            "np.random.seed(7)\n"
            "sns.set_theme(style='whitegrid')"
        ),
        nbf.v4.new_markdown_cell(
            "## Scenario Exercise: Online Learning Platform\n"
            "You are a junior data scientist at an online learning company.\n"
            "Your manager asks:\n"
            "\n"
            "**'Can we identify patterns that relate to course completion so the student success team can intervene early?'**\n"
            "\n"
            "You will start with a simulated dataset representing learner behavior."
        ),
        nbf.v4.new_code_cell(
            "# Create a realistic simulated dataset\n"
            "n = 300\n"
            "study_hours = np.random.normal(loc=6, scale=2, size=n).clip(0, 14)\n"
            "attendance = np.random.normal(loc=80, scale=12, size=n).clip(30, 100)\n"
            "assignments_submitted = np.random.poisson(lam=7, size=n).clip(0, 10)\n"
            "discussion_posts = np.random.poisson(lam=4, size=n)\n"
            "\n"
            "score = (\n"
            "    35\n"
            "    + 4.2 * study_hours\n"
            "    + 0.35 * attendance\n"
            "    + 2.8 * assignments_submitted\n"
            "    + 0.9 * discussion_posts\n"
            "    + np.random.normal(0, 7, size=n)\n"
            ").clip(0, 100)\n"
            "\n"
            "completed = (score >= 70).astype(int)\n"
            "\n"
            "df = pd.DataFrame({\n"
            "    'student_id': np.arange(1, n + 1),\n"
            "    'study_hours_per_week': study_hours.round(2),\n"
            "    'attendance_rate': attendance.round(1),\n"
            "    'assignments_submitted': assignments_submitted,\n"
            "    'discussion_posts': discussion_posts,\n"
            "    'final_score': score.round(1),\n"
            "    'completed_course': completed\n"
            "})\n"
            "\n"
            "df.head()"
        ),
        nbf.v4.new_markdown_cell(
            "## First Data Inspection\n"
            "A data scientist should always inspect shape, types, summary stats, and quality before deep analysis."
        ),
        nbf.v4.new_code_cell(
            "print('Shape:', df.shape)\n"
            "display(df.info())\n"
            "display(df.describe(include='all').T)"
        ),
        nbf.v4.new_markdown_cell("## Data Cleaning Task"),
        nbf.v4.new_code_cell(
            "# Inject a few missing values for practice\n"
            "df.loc[df.sample(frac=0.04, random_state=12).index, 'study_hours_per_week'] = np.nan\n"
            "df.loc[df.sample(frac=0.03, random_state=21).index, 'attendance_rate'] = np.nan\n"
            "\n"
            "print('Missing values before cleaning:')\n"
            "display(df.isna().sum())\n"
            "\n"
            "# Clean with robust defaults\n"
            "df['study_hours_per_week'] = df['study_hours_per_week'].fillna(df['study_hours_per_week'].median())\n"
            "df['attendance_rate'] = df['attendance_rate'].fillna(df['attendance_rate'].mean())\n"
            "\n"
            "print('Missing values after cleaning:')\n"
            "display(df.isna().sum())"
        ),
        nbf.v4.new_markdown_cell("## Visualization Tasks"),
        nbf.v4.new_code_cell(
            "# 1) Distribution of final scores\n"
            "plt.figure(figsize=(9, 4))\n"
            "sns.histplot(df['final_score'], kde=True, bins=25, color='teal')\n"
            "plt.title('Distribution of Final Scores')\n"
            "plt.xlabel('Final Score')\n"
            "plt.ylabel('Number of Students')\n"
            "plt.show()"
        ),
        nbf.v4.new_code_cell(
            "# 2) Completion rate\n"
            "completion_rate = df['completed_course'].mean() * 100\n"
            "print(f'Completion rate: {completion_rate:.1f}%')\n"
            "\n"
            "plt.figure(figsize=(6, 4))\n"
            "sns.countplot(data=df, x='completed_course', palette='Set2')\n"
            "plt.xticks([0, 1], ['Not Completed', 'Completed'])\n"
            "plt.title('Course Completion Counts')\n"
            "plt.xlabel('Outcome')\n"
            "plt.ylabel('Count')\n"
            "plt.show()"
        ),
        nbf.v4.new_code_cell(
            "# 3) Relationship between effort and performance\n"
            "plt.figure(figsize=(8, 5))\n"
            "sns.scatterplot(\n"
            "    data=df,\n"
            "    x='study_hours_per_week',\n"
            "    y='final_score',\n"
            "    hue='completed_course',\n"
            "    palette={0: 'tomato', 1: 'seagreen'},\n"
            "    alpha=0.75\n"
            ")\n"
            "plt.title('Study Hours vs Final Score')\n"
            "plt.xlabel('Study Hours per Week')\n"
            "plt.ylabel('Final Score')\n"
            "plt.legend(title='Completed', labels=['No', 'Yes'])\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            "## Applied Insight Example\n"
            "Use grouped analysis to find practical intervention points."
        ),
        nbf.v4.new_code_cell(
            "grouped = df.groupby('completed_course')[['study_hours_per_week', 'attendance_rate', 'assignments_submitted', 'final_score']].mean().round(2)\n"
            "grouped.index = ['Not Completed', 'Completed']\n"
            "grouped"
        ),
        nbf.v4.new_markdown_cell(
            "## Practice Exercises\n"
            "1. Create a new feature called `engagement_index` using:\n"
            "   `0.5 * study_hours_per_week + 0.3 * attendance_rate/10 + 0.2 * discussion_posts`\n"
            "2. Compare average `engagement_index` by completion status.\n"
            "3. Plot a boxplot of `final_score` by completion status.\n"
            "4. Identify one threshold rule (for example, attendance below X%) that could trigger student support outreach.\n"
            "5. Write 3 business recommendations for the student success team."
        ),
        nbf.v4.new_markdown_cell(
            "## Challenge Task (Portfolio Scenario)\n"
            "You are presenting to non-technical stakeholders. Build a short analysis that includes:\n"
            "- One clear problem statement\n"
            "- Three key visualizations\n"
            "- Two measurable recommendations\n"
            "- One risk or limitation in your analysis\n"
            "\n"
            "Deliverable: create a markdown summary that could be reused in a GitHub project README."
        ),
        nbf.v4.new_markdown_cell(
            "## Summary\n"
            "You learned what data science is and why it matters in real organizations.\n"
            "You practiced the first stages of a professional workflow: framing, exploring, cleaning, visualizing, and communicating insights.\n"
            "In upcoming notebooks, you will deepen your Python, statistics, SQL, and machine learning skills and turn this foundation into portfolio-ready projects."
        ),
    ]
    return nb


def ensure_directories() -> None:
    os.makedirs(ROOT, exist_ok=True)
    os.makedirs(os.path.join(ROOT, "datasets"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "resources"), exist_ok=True)

    for module in COURSE_STRUCTURE:
        os.makedirs(os.path.join(ROOT, module), exist_ok=True)


def write_text_resources() -> None:
    datasets_readme = os.path.join(ROOT, "datasets", "README.md")
    resources_readme = os.path.join(ROOT, "resources", "README.md")

    with open(datasets_readme, "w", encoding="utf-8") as f:
        f.write(
            "# Datasets\n\n"
            "Place CSV/Excel/JSON datasets here. Suggested datasets:\n"
            "- Customer churn\n"
            "- Sales transactions\n"
            "- Public health indicators\n"
            "- Education outcomes\n"
        )

    with open(resources_readme, "w", encoding="utf-8") as f:
        f.write(
            "# Resources\n\n"
            "Use this directory for:\n"
            "- Data dictionaries\n"
            "- Project rubrics\n"
            "- Presentation templates\n"
            "- Helpful references and cheatsheets\n"
        )


def generate_notebooks() -> None:
    for module, notebooks in COURSE_STRUCTURE.items():
        for notebook in notebooks:
            notebook_path = os.path.join(ROOT, module, notebook)

            if module == "01_Introduction_to_Data_Science" and notebook == "01_What_is_Data_Science.ipynb":
                nb = make_full_intro_notebook()
            elif module == "08_Data_Projects":
                nb = make_project_notebook(notebook)
            elif module == "09_Capstone_Project":
                nb = make_capstone_notebook(notebook)
            else:
                nb = make_standard_notebook(module, notebook)

            with open(notebook_path, "w", encoding="utf-8") as f:
                nbf.write(nb, f)


def print_tree() -> None:
    print("Data Science/")
    for module, notebooks in COURSE_STRUCTURE.items():
        print(f"├── {module}/")
        for nb_name in notebooks:
            print(f"│   ├── {nb_name}")
    print("├── datasets/")
    print("│   └── README.md")
    print("└── resources/")
    print("    └── README.md")


def main() -> None:
    ensure_directories()
    write_text_resources()
    generate_notebooks()
    print_tree()
    print("\nCourse environment created successfully.")


if __name__ == "__main__":
    main()
